import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserPreferences, UserStats, DailyStats } from '@/lib/types';

interface UserStore {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    dailyStats: DailyStats[];
    weeklyStats: DailyStats[];

    // Actions
    setUser: (user: User | null) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
    updateStats: (stats: Partial<UserStats>) => void;
    addDailyStats: (stats: DailyStats) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

const defaultPreferences: UserPreferences = {
    theme: 'light',
    sensitivity: 0.7,
    notifications: true,
    soundsEnabled: true,
    pomodoroEnabled: false,
    pomodoroDuration: 25,
    breakDuration: 5,
    backgroundBlur: true,
};

const defaultStats: UserStats = {
    totalFocusMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    averageProductivityScore: 0,
};

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            // Initial State
            user: null,
            isAuthenticated: false,
            isLoading: true,
            dailyStats: [],
            weeklyStats: [],

            // Actions
            setUser: (user: User | null) => {
                set({
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                });
            },

            updatePreferences: (preferences: Partial<UserPreferences>) => {
                const { user } = get();
                if (!user) return;

                set({
                    user: {
                        ...user,
                        preferences: { ...user.preferences, ...preferences },
                    },
                });
            },

            updateStats: (stats: Partial<UserStats>) => {
                const { user } = get();
                if (!user) return;

                set({
                    user: {
                        ...user,
                        stats: { ...user.stats, ...stats },
                    },
                });
            },

            addDailyStats: (stats: DailyStats) => {
                const { dailyStats } = get();
                const existingIndex = dailyStats.findIndex(s => s.date === stats.date);

                if (existingIndex >= 0) {
                    // Update existing
                    const updated = [...dailyStats];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        focusMinutes: updated[existingIndex].focusMinutes + stats.focusMinutes,
                        distractedMinutes: updated[existingIndex].distractedMinutes + stats.distractedMinutes,
                        sessionsCount: updated[existingIndex].sessionsCount + 1,
                        productivityScore: Math.round(
                            (updated[existingIndex].productivityScore * updated[existingIndex].sessionsCount + stats.productivityScore) /
                            (updated[existingIndex].sessionsCount + 1)
                        ),
                    };
                    set({ dailyStats: updated });
                } else {
                    // Add new
                    set({ dailyStats: [...dailyStats, stats].slice(-30) }); // Keep last 30 days
                }
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    dailyStats: [],
                    weeklyStats: [],
                });
            },
        }),
        {
            name: 'zenfocus-user-storage',
            partialize: (state) => ({
                user: state.user,
                dailyStats: state.dailyStats,
            }),
        }
    )
);

// Demo user for testing without Firebase
export const createDemoUser = (): User => ({
    id: 'demo-user',
    email: 'demo@zenfocus.app',
    displayName: 'Focus Seeker',
    preferences: defaultPreferences,
    stats: {
        ...defaultStats,
        totalFocusMinutes: 1250,
        currentStreak: 5,
        longestStreak: 12,
        totalSessions: 48,
        averageProductivityScore: 78,
    },
    createdAt: Date.now(),
});
