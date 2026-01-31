import { create } from 'zustand';
import { Session, FocusState, EventSegment } from '@/lib/types';

interface SessionStore {
    // State
    isActive: boolean;
    isPaused: boolean;
    currentSession: Session | null;
    elapsedTime: number;
    currentFocusState: FocusState;
    stateHistory: EventSegment[];
    lastStateChange: number;
    cameraPermission: 'pending' | 'granted' | 'denied';

    // Actions
    startSession: (userId: string) => void;
    pauseSession: () => void;
    resumeSession: () => void;
    endSession: () => Session | null;
    updateElapsedTime: (time: number) => void;
    updateFocusState: (state: FocusState, confidence: number) => void;
    setCameraPermission: (status: 'pending' | 'granted' | 'denied') => void;
    reset: () => void;
}

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useSessionStore = create<SessionStore>((set, get) => ({
    // Initial State
    isActive: false,
    isPaused: false,
    currentSession: null,
    elapsedTime: 0,
    currentFocusState: 'IDLE',
    stateHistory: [],
    lastStateChange: 0,
    cameraPermission: 'pending',

    // Actions
    startSession: (userId: string) => {
        const now = Date.now();
        const session: Session = {
            id: generateSessionId(),
            userId,
            startTime: now,
            status: 'active',
            focusTimeline: [],
            totalFocusMinutes: 0,
            totalDistractedMinutes: 0,
            distractionCount: 0,
        };

        set({
            isActive: true,
            isPaused: false,
            currentSession: session,
            elapsedTime: 0,
            currentFocusState: 'FOCUSED',
            stateHistory: [],
            lastStateChange: now,
        });
    },

    pauseSession: () => {
        const { currentSession, currentFocusState, lastStateChange, stateHistory } = get();
        if (!currentSession) return;

        const now = Date.now();

        // Add current segment to history
        const newSegment: EventSegment = {
            start: lastStateChange,
            end: now,
            state: currentFocusState,
            confidence: 0.8,
        };

        set({
            isPaused: true,
            stateHistory: [...stateHistory, newSegment],
            currentSession: { ...currentSession, status: 'paused' },
        });
    },

    resumeSession: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
            isPaused: false,
            lastStateChange: Date.now(),
            currentSession: { ...currentSession, status: 'active' },
        });
    },

    endSession: () => {
        const { currentSession, stateHistory, currentFocusState, lastStateChange, elapsedTime } = get();
        if (!currentSession) return null;

        const now = Date.now();

        // Add final segment
        const finalSegment: EventSegment = {
            start: lastStateChange,
            end: now,
            state: currentFocusState,
            confidence: 0.8,
        };

        const allSegments = [...stateHistory, finalSegment];

        // Calculate stats
        let totalFocusMs = 0;
        let totalDistractedMs = 0;
        let distractionCount = 0;

        allSegments.forEach((segment, index) => {
            const duration = segment.end - segment.start;
            if (segment.state === 'FOCUSED') {
                totalFocusMs += duration;
            } else if (segment.state === 'DISTRACTED') {
                totalDistractedMs += duration;
                // Count transitions to distracted
                if (index > 0 && allSegments[index - 1].state !== 'DISTRACTED') {
                    distractionCount++;
                }
            }
        });

        // Calculate productivity score (0-100)
        const totalActiveMs = totalFocusMs + totalDistractedMs;
        const focusRatio = totalActiveMs > 0 ? totalFocusMs / totalActiveMs : 0;
        const distractionPenalty = Math.min(distractionCount * 2, 20); // Max 20% penalty
        const productivityScore = Math.round(Math.max(0, (focusRatio * 100) - distractionPenalty));

        const completedSession: Session = {
            ...currentSession,
            endTime: now,
            status: 'completed',
            focusTimeline: allSegments,
            totalFocusMinutes: Math.round(totalFocusMs / 60000),
            totalDistractedMinutes: Math.round(totalDistractedMs / 60000),
            distractionCount,
            productivityScore,
        };

        set({
            isActive: false,
            isPaused: false,
            currentSession: null,
            elapsedTime: 0,
            stateHistory: [],
        });

        return completedSession;
    },

    updateElapsedTime: (time: number) => {
        set({ elapsedTime: time });
    },

    updateFocusState: (state: FocusState, confidence: number) => {
        const { currentFocusState, lastStateChange, stateHistory, isPaused } = get();

        if (isPaused) return;

        // Only record state change if state actually changed
        if (state !== currentFocusState) {
            const now = Date.now();

            // Add previous segment to history
            if (lastStateChange > 0) {
                const segment: EventSegment = {
                    start: lastStateChange,
                    end: now,
                    state: currentFocusState,
                    confidence,
                };

                set({
                    stateHistory: [...stateHistory, segment],
                    currentFocusState: state,
                    lastStateChange: now,
                });
            } else {
                set({
                    currentFocusState: state,
                    lastStateChange: now,
                });
            }
        }
    },

    setCameraPermission: (status) => {
        set({ cameraPermission: status });
    },

    reset: () => {
        set({
            isActive: false,
            isPaused: false,
            currentSession: null,
            elapsedTime: 0,
            currentFocusState: 'IDLE',
            stateHistory: [],
            lastStateChange: 0,
            cameraPermission: 'pending',
        });
    },
}));
