import { FocusState, FrameAnalysis } from '@/lib/types';

// ========================================
// ZENFOCUS VISION PROCESSOR
// Smart Focus Detection with Activity Recognition
// Runs entirely in the browser for privacy
// ========================================

interface VisionConfig {
    sensitivity: number; // 0-1, lower = more lenient
    minConfidence: number;
    stateBufferSize: number;
    studyMode: boolean; // If true, looking down (at book/desk) is considered focused
}

const DEFAULT_CONFIG: VisionConfig = {
    sensitivity: 0.5, // More lenient default
    minConfidence: 0.6,
    stateBufferSize: 15, // More frames for smoother detection
    studyMode: true, // Allow looking down as focused (book/writing)
};

// Activity patterns
type ActivityType = 'screen_work' | 'reading' | 'writing' | 'thinking' | 'distracted' | 'sleeping' | 'away';

export class VisionProcessor {
    private config: VisionConfig;
    private faceLandmarker: any = null;
    private stateBuffer: FocusState[] = [];
    private activityBuffer: ActivityType[] = [];
    private isInitialized = false;
    private video: HTMLVideoElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private animationFrameId: number | null = null;
    private onStateChange: ((state: FocusState, confidence: number) => void) | null = null;
    private onFrameAnalysis: ((analysis: FrameAnalysis, landmarks?: any) => void) | null = null;

    // Tracking for temporal patterns
    private eyesClosedFrames = 0;
    private lookingAwayFrames = 0;
    private lastGazeDirection: string = 'center';

    constructor(config: Partial<VisionConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    async initialize(): Promise<boolean> {
        try {
            // Dynamic import of MediaPipe
            const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

            const filesetResolver = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            );

            this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                    // Let MediaPipe choose the best delegate to avoid "forced fallback" logs
                },
                outputFaceBlendshapes: true,
                runningMode: 'VIDEO',
                numFaces: 1,
            });

            this.isInitialized = true;
            console.log('✅ Vision processor initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize vision processor:', error);
            return false;
        }
    }

    async startCamera(videoElement: HTMLVideoElement): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user',
                },
            });

            videoElement.srcObject = stream;
            this.video = videoElement;

            // Create offscreen canvas for processing
            this.canvas = document.createElement('canvas');
            this.canvas.width = 640;
            this.canvas.height = 480;
            this.ctx = this.canvas.getContext('2d');

            // Wait for video to be ready and playing
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Video load timeout'));
                }, 10000);

                videoElement.onloadedmetadata = async () => {
                    try {
                        await videoElement.play();
                        clearTimeout(timeout);
                        console.log('📹 Video playing, dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
                        resolve();
                    } catch (playError) {
                        clearTimeout(timeout);
                        reject(playError);
                    }
                };

                videoElement.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Video element error'));
                };
            });

            console.log('📹 Camera started successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to start camera:', error);
            return false;
        }
    }

    stopCamera(): void {
        if (this.video?.srcObject) {
            const stream = this.video.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            this.video.srcObject = null;
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        console.log('📹 Camera stopped');
    }

    startProcessing(
        onStateChange: (state: FocusState, confidence: number) => void,
        onFrameAnalysis?: (analysis: FrameAnalysis, landmarks?: any) => void
    ): void {
        this.onStateChange = onStateChange;
        this.onFrameAnalysis = onFrameAnalysis || null;
        this.processFrame();
    }

    stopProcessing(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.onStateChange = null;
        this.onFrameAnalysis = null;
    }

    private processFrame = (): void => {
        if (!this.video || !this.faceLandmarker || !this.isInitialized) {
            this.animationFrameId = requestAnimationFrame(this.processFrame);
            return;
        }

        const startTimeMs = performance.now();

        try {
            const results = this.faceLandmarker.detectForVideo(this.video, startTimeMs);
            const analysis = this.analyzeResults(results);

            // Determine focus state from analysis with activity recognition
            const { state, confidence, activity } = this.determineStateWithActivity(analysis);
            analysis.activity = activity;

            if (this.onFrameAnalysis) {
                // Pass landmarks for visualization
                this.onFrameAnalysis(analysis, results.faceLandmarks);
            }

            // Buffer for smoothing
            this.stateBuffer.push(state);
            if (this.stateBuffer.length > this.config.stateBufferSize) {
                this.stateBuffer.shift();
            }

            this.activityBuffer.push(activity);
            if (this.activityBuffer.length > this.config.stateBufferSize) {
                this.activityBuffer.shift();
            }

            // Get smoothed state (most frequent in buffer)
            const smoothedState = this.getSmoothedState();

            if (this.onStateChange) {
                this.onStateChange(smoothedState, confidence);
            }
        } catch (error: any) {
            // Only log if it's not a known internal "info" string mistaken for error
            if (error?.message && !error.message.includes('delegate')) {
                console.warn('Vision Processing Frame Error:', error.message);
            }
        }

        // Process at ~10 FPS to save resources
        setTimeout(() => {
            this.animationFrameId = requestAnimationFrame(this.processFrame);
        }, 100);
    };

    private analyzeResults(results: any): FrameAnalysis {
        const now = Date.now();

        if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
            return {
                timestamp: now,
                gazeDirection: 'center',
                eyesOpen: true,
                faceDetected: false,
                headPose: { pitch: 0, yaw: 0, roll: 0 },
                confidence: 0,
            };
        }

        const landmarks = results.faceLandmarks[0];
        const blendshapes = results.faceBlendshapes?.[0]?.categories || [];

        // Extract eye blink data
        const eyeBlinkLeft = blendshapes.find((b: any) => b.categoryName === 'eyeBlinkLeft')?.score || 0;
        const eyeBlinkRight = blendshapes.find((b: any) => b.categoryName === 'eyeBlinkRight')?.score || 0;
        const avgEyeBlink = (eyeBlinkLeft + eyeBlinkRight) / 2;

        // More lenient eye closed detection (0.6 threshold instead of 0.5)
        const eyesClosed = avgEyeBlink > 0.6;

        // Extract gaze/head pose from landmarks
        // We use relative positioning between eyes and nose for more stable gaze detection
        const noseTip = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const mouthCenter = landmarks[13];
        const forehead = landmarks[10];

        // Eye width as a reference for distance (normalization factor)
        const eyeDistance = Math.sqrt(
            Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
        );

        // Calculate horizontal offset (Yaw)
        // Ratio of nose position between eyes
        const eyeCenter_x = (leftEye.x + rightEye.x) / 2;
        const relativeYaw = (noseTip.x - eyeCenter_x) / eyeDistance;

        // Calculate vertical offset (Pitch)
        const eyeCenter_y = (leftEye.y + rightEye.y) / 2;
        const faceHeight = Math.abs(mouthCenter.y - forehead.y);
        const relativePitch = (noseTip.y - eyeCenter_y) / faceHeight;

        // More lenient thresholds (calibrated for standard sitting)
        const yawThreshold = 0.32; // Increased from 0.25 for more leniency
        const pitchThreshold = 0.20; // Increased from 0.15 for more leniency

        // Determine gaze direction
        let gazeDirection: 'center' | 'left' | 'right' | 'up' | 'down' = 'center';

        if (relativeYaw > yawThreshold) {
            gazeDirection = 'right';
        } else if (relativeYaw < -yawThreshold) {
            gazeDirection = 'left';
        } else if (relativePitch > pitchThreshold) {
            gazeDirection = 'down';
        } else if (relativePitch < -pitchThreshold * 1.5) { // Up is usually more tolerated
            gazeDirection = 'up';
        }

        return {
            timestamp: now,
            gazeDirection,
            eyesOpen: !eyesClosed,
            faceDetected: true,
            headPose: {
                pitch: relativePitch * 100, // Normalized for display
                yaw: relativeYaw * 100,
                roll: (rightEye.y - leftEye.y) * 100,
            },
            confidence: 0.85,
        };

    }

    private determineStateWithActivity(analysis: FrameAnalysis): {
        state: FocusState;
        confidence: number;
        activity: ActivityType
    } {
        // No face detected = Away
        if (!analysis.faceDetected) {
            this.lookingAwayFrames++;
            this.eyesClosedFrames = 0;
            return {
                state: 'AWAY',
                confidence: 0.9,
                activity: 'away'
            };
        }

        // Eyes closed tracking
        if (!analysis.eyesOpen) {
            this.eyesClosedFrames++;
            this.lookingAwayFrames = 0;

            // Need sustained eye closure for SLEEPING (about 2 seconds = 20 frames at 10fps)
            if (this.eyesClosedFrames > 20) {
                return {
                    state: 'SLEEPING',
                    confidence: 0.85,
                    activity: 'sleeping'
                };
            }

            // Could be blinking or thinking with eyes closed briefly
            return {
                state: 'FOCUSED',
                confidence: 0.6,
                activity: 'thinking'
            };
        } else {
            this.eyesClosedFrames = 0;
        }

        const { pitch, yaw } = analysis.headPose;

        // ========================================
        // SMART ACTIVITY DETECTION
        // ========================================

        // Looking at screen (center) = Screen work / Coding
        if (analysis.gazeDirection === 'center') {
            this.lookingAwayFrames = 0;
            return {
                state: 'FOCUSED',
                confidence: 0.9,
                activity: 'screen_work'
            };
        }

        // Looking DOWN = Reading/Writing (if study mode enabled)
        if (analysis.gazeDirection === 'down') {
            if (this.config.studyMode) {
                // Looking down is considered focused when studying
                // Could be reading a book, writing notes, looking at phone for reference
                this.lookingAwayFrames = 0;
                return {
                    state: 'FOCUSED',
                    confidence: 0.8,
                    activity: Math.abs(yaw) < 5 ? 'reading' : 'writing'
                };
            }
        }

        // Looking UP = Thinking (short-term focused, long-term distracted)
        if (analysis.gazeDirection === 'up') {
            this.lookingAwayFrames++;

            // Brief looking up is thinking
            if (this.lookingAwayFrames < 15) { // ~1.5 seconds
                return {
                    state: 'FOCUSED',
                    confidence: 0.7,
                    activity: 'thinking'
                };
            }
        }

        // Looking LEFT/RIGHT = Potentially distracted
        if (analysis.gazeDirection === 'left' || analysis.gazeDirection === 'right') {
            this.lookingAwayFrames++;

            // Brief glances are OK (checking clock, window, etc.)
            if (this.lookingAwayFrames < 10) { // ~1 second grace period
                return {
                    state: 'FOCUSED',
                    confidence: 0.6,
                    activity: 'thinking'
                };
            }

            // Sustained looking away = distracted
            return {
                state: 'DISTRACTED',
                confidence: 0.75,
                activity: 'distracted'
            };
        }

        // Default: Looking up for too long
        if (this.lookingAwayFrames > 20) {
            return {
                state: 'DISTRACTED',
                confidence: 0.7,
                activity: 'distracted'
            };
        }

        // Fallback
        return {
            state: 'FOCUSED',
            confidence: 0.7,
            activity: 'screen_work'
        };
    }

    private getSmoothedState(): FocusState {
        if (this.stateBuffer.length === 0) return 'IDLE';

        const counts: Record<FocusState, number> = {
            FOCUSED: 0,
            DISTRACTED: 0,
            IDLE: 0,
            SLEEPING: 0,
            AWAY: 0,
        };

        this.stateBuffer.forEach((state) => {
            counts[state]++;
        });

        // Find most frequent state
        let maxCount = 0;
        let maxState: FocusState = 'FOCUSED'; // Default to FOCUSED instead of IDLE

        (Object.keys(counts) as FocusState[]).forEach((state) => {
            if (counts[state] > maxCount) {
                maxCount = counts[state];
                maxState = state;
            }
        });

        // Special case: if sleeping for more than 60% of buffer, confirm sleeping
        if (counts.SLEEPING / this.stateBuffer.length > 0.6) {
            return 'SLEEPING';
        }

        // If away for more than 40%, confirm away
        if (counts.AWAY / this.stateBuffer.length > 0.4) {
            return 'AWAY';
        }

        // If distracted for more than 50%, confirm distracted
        if (counts.DISTRACTED / this.stateBuffer.length > 0.5) {
            return 'DISTRACTED';
        }

        // Otherwise favor FOCUSED if there's any significant presence
        if (counts.FOCUSED > 0 && counts.FOCUSED >= counts.DISTRACTED) {
            return 'FOCUSED';
        }

        return maxState;
    }

    setStudyMode(enabled: boolean): void {
        this.config.studyMode = enabled;
        console.log(`📚 Study mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    updateConfig(config: Partial<VisionConfig>): void {
        this.config = { ...this.config, ...config };
    }

    isReady(): boolean {
        return this.isInitialized;
    }

    destroy(): void {
        this.stopProcessing();
        this.stopCamera();
        try {
            this.faceLandmarker?.close();
        } catch (e) {
            // Ignore close errors - MediaPipe may already be cleaned up
        }
        this.faceLandmarker = null;
        this.isInitialized = false;
        this.stateBuffer = [];
        this.activityBuffer = [];
        this.eyesClosedFrames = 0;
        this.lookingAwayFrames = 0;
    }
}

// Singleton instance
let visionProcessorInstance: VisionProcessor | null = null;

export const getVisionProcessor = (): VisionProcessor => {
    if (!visionProcessorInstance) {
        visionProcessorInstance = new VisionProcessor();
    }
    return visionProcessorInstance;
};

export const destroyVisionProcessor = (): void => {
    if (visionProcessorInstance) {
        visionProcessorInstance.destroy();
        visionProcessorInstance = null;
    }
};
