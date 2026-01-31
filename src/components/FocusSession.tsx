'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Camera, CameraOff, Volume2, VolumeX, AlertCircle, Eye, Focus, Zap, Shield, Clock } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { useAuth } from '@/lib/AuthContext';
import { getVisionProcessor, destroyVisionProcessor } from '@/lib/visionProcessor';
import { saveSession, updateUserStatsInFirestore } from '@/lib/sessionService';
import { FocusState, FrameAnalysis, Session } from '@/lib/types';
import Button from '@/components/Button';
import FocusIndicator from '@/components/FocusIndicator';
import GlassCard from '@/components/GlassCard';
import SessionSummary from '@/components/SessionSummary';
import styles from './FocusSession.module.css';

export function FocusSession() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const timerRef = useRef<number | null>(null);
    const landmarksRef = useRef<any>(null);
    const cameraStartedRef = useRef(false);

    const {
        isActive,
        isPaused,
        elapsedTime,
        currentFocusState,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        updateElapsedTime,
        updateFocusState,
        setCameraPermission,
    } = useSessionStore();

    const { zenFocusUser } = useAuth();

    const [isInitializing, setIsInitializing] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmEnd, setShowConfirmEnd] = useState(false);
    const [isBrowserSupported, setIsBrowserSupported] = useState(true);
    const [frameAnalysis, setFrameAnalysis] = useState<FrameAnalysis | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [trackingMode, setTrackingMode] = useState<'AI' | 'TIMER'>('AI');
    const [completedSessionData, setCompletedSessionData] = useState<Session | null>(null);

    // Sound effect
    const playStartSound = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            audio.volume = 0.4;
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
            console.log('Audio context error:', e);
        }
    }, [soundEnabled]);

    // Check browser support on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            setIsBrowserSupported(isSupported);
            if (!isSupported) {
                setError('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Edge.');
            }
        }
    }, []);

    // Format time display
    const formatTime = useCallback((seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Draw face landmarks overlay
    const drawLandmarks = useCallback(() => {
        if (trackingMode !== 'AI') return;
        const canvas = overlayCanvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video || !landmarksRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const landmarks = landmarksRef.current;
        if (!landmarks || landmarks.length === 0) return;

        const points = landmarks[0];
        if (!points) return;

        ctx.strokeStyle = 'rgba(122, 139, 104, 0.6)';
        ctx.lineWidth = 1;

        const faceOutline = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

        ctx.beginPath();
        faceOutline.forEach((idx, i) => {
            const point = points[idx];
            if (point) {
                const x = point.x * canvas.width;
                const y = point.y * canvas.height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.stroke();
    }, [trackingMode]);

    // Timer effect
    useEffect(() => {
        if (isActive && !isPaused) {
            timerRef.current = window.setInterval(() => {
                updateElapsedTime(useSessionStore.getState().elapsedTime + 1);
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isActive, isPaused, updateElapsedTime]);

    // Start camera feed for AI sessions
    useEffect(() => {
        const startAI = async () => {
            if (!isActive || trackingMode !== 'AI' || cameraStartedRef.current || !videoRef.current) return;

            const visionProcessor = getVisionProcessor();
            try {
                const started = await visionProcessor.startCamera(videoRef.current);
                if (started) {
                    cameraStartedRef.current = true;
                    setCameraReady(true);
                    visionProcessor.startProcessing(
                        (state, conf) => updateFocusState(state, conf),
                        (analysis, landmarks) => {
                            setFrameAnalysis(analysis);
                            if (landmarks) {
                                landmarksRef.current = landmarks;
                                drawLandmarks();
                            }
                        }
                    );
                }
            } catch (err) {
                console.error('AI Init failed:', err);
                setError('Failed to start AI tracking');
            }
        };

        if (isActive && trackingMode === 'AI') {
            setTimeout(startAI, 100);
        }
    }, [isActive, trackingMode, updateFocusState, drawLandmarks]);

    const handleStartSession = async (mode: 'AI' | 'TIMER') => {
        setTrackingMode(mode);
        setIsInitializing(true);
        setError(null);

        try {
            if (mode === 'AI') {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('Camera not supported');
                }
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(t => t.stop());
                setCameraPermission('granted');

                const visionProcessor = getVisionProcessor();
                const initialized = await visionProcessor.initialize();
                if (!initialized) throw new Error('AI Engine failed to start');
            }

            playStartSound();
            startSession(zenFocusUser?.id || 'demo-user');
        } catch (err: any) {
            setError(err.message || 'Failed to start');
        } finally {
            setIsInitializing(false);
        }
    };

    const handleTogglePause = () => isPaused ? resumeSession() : pauseSession();
    const handleEndSession = () => elapsedTime > 60 ? setShowConfirmEnd(true) : confirmEndSession();

    const confirmEndSession = async () => {
        cameraStartedRef.current = false;
        setCameraReady(false);
        const completed = endSession();
        if (trackingMode === 'AI') destroyVisionProcessor();

        setShowConfirmEnd(false);
        setFrameAnalysis(null);
        landmarksRef.current = null;

        if (completed) {
            setCompletedSessionData(completed);
            if (zenFocusUser) {
                try {
                    await saveSession(completed);
                    await updateUserStatsInFirestore(zenFocusUser.id, completed);
                } catch (e) { console.error('Cloud save failed:', e); }
            }
        }
    };

    const getStateColor = () => {
        const colors: Record<FocusState, string> = {
            FOCUSED: '#7A8B68',
            DISTRACTED: '#C9A08A',
            IDLE: '#D4CFE6',
            SLEEPING: '#9CA3AF',
            AWAY: '#94A3B8',
        };
        return colors[currentFocusState] || '#7A8B68';
    };

    return (
        <motion.div
            className={styles.container}
            animate={{ backgroundColor: isActive ? `${getStateColor()}10` : 'rgba(0,0,0,0)' }}
        >
            {!isActive && (
                <motion.div className={styles.preSession} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className={styles.heroIcon}>
                        <div className={styles.heroIconInner}>
                            <Focus size={48} />
                        </div>
                    </div>
                    <h1 className={styles.title}>ZenFocus</h1>

                    <div className={styles.modeCards}>
                        <motion.div
                            className={`${styles.modeCard} ${trackingMode === 'AI' ? styles.activeMode : ''}`}
                            onClick={() => setTrackingMode('AI')}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Eye size={32} />
                            <h3>AI Tracking</h3>
                            <p>Real-time focus detection. Most accurate.</p>
                            <div className={styles.modeBadge}>Accurate</div>
                        </motion.div>

                        <motion.div
                            className={`${styles.modeCard} ${trackingMode === 'TIMER' ? styles.activeMode : ''}`}
                            onClick={() => setTrackingMode('TIMER')}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Clock size={32} />
                            <h3>Manual Timer</h3>
                            <p>Classic stopwatch without camera. Privacy first.</p>
                        </motion.div>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.startActions}>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => handleStartSession(trackingMode)}
                            loading={isInitializing}
                        >
                            {trackingMode === 'AI' ? 'Start AI Session' : 'Start Timer Session'}
                        </Button>
                        <p className={styles.privacyNote}>
                            {trackingMode === 'AI' ? '🔒 Local processing. No video uploaded.' : '⏱️ Simple tracking without camera access.'}
                        </p>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {isActive && (
                    <motion.div className={styles.activeSession} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className={styles.timer}>
                            <span className={styles.timerValue}>{formatTime(elapsedTime)}</span>
                            <FocusIndicator state={currentFocusState} size="lg" />
                        </div>

                        <GlassCard className={styles.cameraCard}>
                            {trackingMode === 'AI' ? (
                                <div className={styles.cameraWrapper}>
                                    {!cameraReady && (
                                        <div className={styles.cameraLoading}>Starting camera...</div>
                                    )}
                                    <video ref={videoRef} className={styles.video} playsInline muted style={{ opacity: cameraEnabled && cameraReady ? 1 : 0, transform: 'scaleX(-1)' }} />
                                    <canvas ref={overlayCanvasRef} className={styles.overlayCanvas} style={{ transform: 'scaleX(-1)' }} />
                                    <div className={styles.focusBorder} style={{ borderColor: getStateColor() }} />

                                    <div className={styles.statusOverlay}>
                                        <div className={styles.statusBadge} style={{ backgroundColor: getStateColor() }}>{currentFocusState}</div>
                                        <div className={styles.privacyBadge}><Shield size={12} /> LOCAL</div>
                                    </div>

                                    <div className={styles.cameraControls}>
                                        <button className={styles.cameraToggle} onClick={() => setCameraEnabled(!cameraEnabled)}>
                                            {cameraEnabled ? <Camera size={18} /> : <CameraOff size={18} />}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.stopwatchView}>
                                    <Clock size={64} color="var(--color-sage-400)" />
                                    <h3>Stopwatch Active</h3>
                                    <p>AI tracking is disabled for this session.</p>
                                </div>
                            )}
                        </GlassCard>

                        {trackingMode === 'AI' && frameAnalysis && (
                            <div className={styles.analysisInfo}>
                                <div className={styles.analysisItem}>
                                    <span>Activity</span>
                                    <span style={{ fontWeight: 600, color: 'var(--color-sage-600)' }}>
                                        {frameAnalysis.activity?.replace('_', ' ').toUpperCase() || 'ANALYZING...'}
                                    </span>
                                </div>
                                <div className={styles.analysisItem}>
                                    <span>Gaze</span>
                                    <span>{frameAnalysis.gazeDirection.toUpperCase()}</span>
                                </div>
                            </div>
                        )}

                        <div className={styles.controls}>
                            <Button variant="secondary" onClick={handleTogglePause}>{isPaused ? 'Resume' : 'Pause'}</Button>
                            <Button variant="danger" onClick={handleEndSession}>End Session</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showConfirmEnd && (
                    <div className={styles.modal}>
                        <GlassCard className={styles.modalContent}>
                            <h3>End Session?</h3>
                            <p>Detailed analysis will be generated.</p>
                            <div className={styles.modalActions}>
                                <Button variant="secondary" onClick={() => setShowConfirmEnd(false)}>Cancel</Button>
                                <Button variant="primary" onClick={confirmEndSession}>End & See Results</Button>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {completedSessionData && (
                    <SessionSummary session={completedSessionData} onClose={() => setCompletedSessionData(null)} />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default FocusSession;
