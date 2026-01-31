// ========================================
// ZENFOCUS TYPE DEFINITIONS
// ========================================

export type FocusState = 'FOCUSED' | 'DISTRACTED' | 'IDLE' | 'SLEEPING' | 'AWAY';

export interface FrameAnalysis {
    timestamp: number;
    gazeDirection: 'center' | 'left' | 'right' | 'up' | 'down';
    eyesOpen: boolean;
    faceDetected: boolean;
    headPose: {
        pitch: number; // Looking up/down
        yaw: number;   // Looking left/right
        roll: number;  // Head tilt
    };
    confidence: number;
    activity?: 'reading' | 'writing' | 'screen_work' | 'thinking' | 'distracted' | 'sleeping' | 'away';
}

export interface EventSegment {
    start: number;
    end: number;
    state: FocusState;
    confidence: number;
}

export interface Session {
    id: string;
    userId: string;
    startTime: number;
    endTime?: number;
    status: 'active' | 'paused' | 'completed' | 'aborted';
    productivityScore?: number;
    focusTimeline: EventSegment[];
    totalFocusMinutes: number;
    totalDistractedMinutes: number;
    distractionCount: number;
    aiSummary?: string;
    aiInsights?: string[];
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    sensitivity: number; // 0-1, how sensitive distraction detection should be
    notifications: boolean;
    soundsEnabled: boolean;
    pomodoroEnabled: boolean;
    pomodoroDuration: number; // minutes
    breakDuration: number; // minutes
    backgroundBlur: boolean; // Privacy feature - blur background
}

export interface UserStats {
    totalFocusMinutes: number;
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
    averageProductivityScore: number;
    lastSessionDate?: string;
}

export interface UserProfile {
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    age?: number;
    profession?: string;
    goals?: string[];
    dailyFocusGoal?: number; // in minutes
}

export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    preferences: UserPreferences;
    stats: UserStats;
    profile?: UserProfile;
    createdAt: number;
}

export interface DailyStats {
    date: string; // YYYY-MM-DD
    focusMinutes: number;
    distractedMinutes: number;
    sessionsCount: number;
    productivityScore: number;
}

export interface AIInsight {
    type: 'tip' | 'observation' | 'encouragement' | 'warning';
    message: string;
    timestamp: number;
}

// Vision Model State
export interface VisionState {
    isInitialized: boolean;
    isProcessing: boolean;
    lastFrame: FrameAnalysis | null;
    currentState: FocusState;
    confidence: number;
    error: string | null;
}

// Session Store State
export interface SessionState {
    isActive: boolean;
    isPaused: boolean;
    currentSession: Session | null;
    elapsedTime: number;
    currentFocusState: FocusState;
    stateHistory: EventSegment[];
}
