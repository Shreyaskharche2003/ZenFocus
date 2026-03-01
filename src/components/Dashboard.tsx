'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Zap, Flame, Target, Award, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getRecentSessions, getWeeklyStats, calculateUserStats } from '@/lib/sessionService';
import GlassCard from '@/components/GlassCard';
import ProgressRing from '@/components/ProgressRing';
import styles from './Dashboard.module.css';

interface RecentSession {
    date: string;
    displayDate: string;
    focusMinutes: number;
    distractedMinutes: number;
    score: number;
}

interface WeeklyDay {
    date: string;
    dayName: string;
    focusMinutes: number;
    sessions: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export function Dashboard() {
    const { zenFocusUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
    const [weeklyData, setWeeklyData] = useState<WeeklyDay[]>([]);
    const [stats, setStats] = useState({
        totalFocusMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalSessions: 0,
        averageProductivityScore: 0,
        todayFocusMinutes: 0,
    });

    // Fetch user data on mount
    useEffect(() => {
        const fetchData = async () => {
            if (!zenFocusUser?.id) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                // Fetch all data in parallel
                const [sessionsData, weeklyStats, userStats] = await Promise.all([
                    getRecentSessions(zenFocusUser.id, 5),
                    getWeeklyStats(zenFocusUser.id),
                    calculateUserStats(zenFocusUser.id),
                ]);

                setRecentSessions(sessionsData);
                setWeeklyData(weeklyStats.days);
                setStats({
                    totalFocusMinutes: userStats.totalFocusMinutes,
                    currentStreak: userStats.currentStreak,
                    longestStreak: userStats.longestStreak,
                    totalSessions: userStats.totalSessions,
                    averageProductivityScore: userStats.averageProductivityScore,
                    todayFocusMinutes: userStats.todayFocusMinutes,
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [zenFocusUser?.id]);

    const displayName = zenFocusUser?.displayName || 'Focus Seeker';
    const firstName = displayName.split(' ')[0];

    const todayGoal = zenFocusUser?.profile?.dailyFocusGoal || 60; // minutes
    const todayProgress = Math.min((stats.todayFocusMinutes / todayGoal) * 100, 100);

    // Find max focus for week chart scaling
    const maxWeeklyFocus = Math.max(...weeklyData.map(d => d.focusMinutes), 60);

    return (
        <motion.div
            className={styles.dashboard}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Welcome Section */}
            <motion.div className={styles.welcome} variants={itemVariants}>
                <h1>Welcome back, {firstName}</h1>
                <p className={styles.greeting}>Ready for a mindful focus session?</p>
            </motion.div>

            {/* Decorative Doodles */}
            <div className={styles.doodleContainer}>
                <motion.svg className={styles.doodle} style={{ top: '15%', right: '5%' }} animate={{ y: [-5, 5, -5], rotate: [-3, 3, -3] }} transition={{ duration: 6, repeat: Infinity }} width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <path d="M30 5 L35 25 L55 30 L35 35 L30 55 L25 35 L5 30 L25 25 Z" stroke="rgba(122,139,104,0.15)" strokeWidth="2" fill="none" />
                </motion.svg>
                <motion.svg className={styles.doodle} style={{ top: '40%', left: '3%' }} animate={{ y: [-8, 4, -8], rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity }} width="50" height="50" viewBox="0 0 50 50" fill="none">
                    <circle cx="25" cy="25" r="18" stroke="rgba(201,160,138,0.12)" strokeWidth="2" fill="none" strokeDasharray="5 5" />
                </motion.svg>
                <motion.svg className={styles.doodle} style={{ bottom: '20%', right: '8%' }} animate={{ y: [-4, 6, -4] }} transition={{ duration: 7, repeat: Infinity }} width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M5 35 L20 5 L35 35 M12 25 L28 25" stroke="rgba(212,207,230,0.15)" strokeWidth="2" fill="none" strokeLinecap="round" />
                </motion.svg>
                <motion.svg className={styles.doodle} style={{ top: '60%', left: '6%' }} animate={{ y: [-6, 3, -6], rotate: [-2, 4, -2] }} transition={{ duration: 9, repeat: Infinity }} width="45" height="45" viewBox="0 0 45 45" fill="none">
                    <path d="M10 35 Q10 10 22 10 Q35 10 35 22 Q35 35 22 35 L10 35 Z M22 10 L22 2 M18 2 L26 2" stroke="rgba(122,139,104,0.12)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </motion.svg>
            </div>

            {/* Loading State */}
            {isLoading && (
                <motion.div className={styles.loadingOverlay} variants={itemVariants}>
                    <Loader2 className={styles.spinner} size={32} />
                    <span>Loading your stats...</span>
                </motion.div>
            )}

            {/* Main Stats Grid */}
            <div className={styles.statsGrid}>
                {/* Today's Progress - Large Card */}
                <motion.div variants={itemVariants}>
                    <GlassCard className={styles.mainCard}>
                        <div className={styles.mainCardContent}>
                            <div className={styles.progressSection}>
                                <ProgressRing
                                    progress={todayProgress}
                                    size={180}
                                    strokeWidth={14}
                                    label={`${stats.todayFocusMinutes}m`}
                                    sublabel="Today's Focus"
                                />
                            </div>
                            <div className={styles.progressDetails}>
                                <h3>Daily Goal</h3>
                                <p className={styles.goalText}>{todayGoal} minutes</p>
                                <div className={styles.progressBar}>
                                    <motion.div
                                        className={styles.progressFill}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${todayProgress}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                                <span className={styles.progressLabel}>
                                    {todayProgress >= 100 ? '🎉 Goal achieved!' : `${Math.round(todayProgress)}% complete`}
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Stat Cards */}
                <motion.div variants={itemVariants}>
                    <GlassCard className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(122, 139, 104, 0.1)' }}>
                            <Flame size={24} color="var(--color-sage-500)" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.currentStreak}</span>
                            <span className={styles.statLabel}>Day Streak</span>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(201, 160, 138, 0.1)' }}>
                            <Clock size={24} color="var(--color-terracotta)" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{(stats.totalFocusMinutes / 60).toFixed(1)}h</span>
                            <span className={styles.statLabel}>Total Focus</span>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(212, 207, 230, 0.1)' }}>
                            <Target size={24} color="var(--color-lavender)" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.totalSessions}</span>
                            <span className={styles.statLabel}>Sessions</span>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(184, 212, 227, 0.1)' }}>
                            <Award size={24} color="var(--color-sky)" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.averageProductivityScore || '—'}%</span>
                            <span className={styles.statLabel}>Avg Score</span>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Weekly Overview */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.weeklyCard}>
                    <h3 className={styles.cardTitle}>
                        <TrendingUp size={20} />
                        This Week
                    </h3>
                    <div className={styles.weeklyChart}>
                        {weeklyData.map((day, index) => (
                            <div key={day.date} className={styles.dayColumn}>
                                <div className={styles.barContainer}>
                                    <motion.div
                                        className={styles.bar}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(day.focusMinutes / maxWeeklyFocus) * 100}%` }}
                                        transition={{ duration: 0.5, delay: 0.1 * index }}
                                        style={{
                                            background: day.focusMinutes > 0
                                                ? 'linear-gradient(to top, var(--color-sage-500), var(--color-sage-400))'
                                                : 'var(--color-sage-100)',
                                        }}
                                    />
                                </div>
                                <span className={styles.dayLabel}>{day.dayName}</span>
                                {day.focusMinutes > 0 && (
                                    <span className={styles.dayValue}>{day.focusMinutes}m</span>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.recentCard}>
                    <h3 className={styles.cardTitle}>
                        <Zap size={20} />
                        Recent Sessions
                    </h3>
                    <div className={styles.sessionsList}>
                        {recentSessions.length === 0 ? (
                            <div className={styles.emptySessions}>
                                <p>No sessions yet. Start your first focus session!</p>
                            </div>
                        ) : (
                            recentSessions.map((session, index) => (
                                <motion.div
                                    key={`${session.date}-${index}`}
                                    className={styles.sessionItem}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <div className={styles.sessionDate}>{session.displayDate}</div>
                                    <div className={styles.sessionStats}>
                                        <span className={styles.focusTime}>{session.focusMinutes}m focus</span>
                                        <span className={styles.separator}>•</span>
                                        <span className={styles.distractedTime}>{session.distractedMinutes}m distracted</span>
                                    </div>
                                    <div className={styles.sessionScore}>
                                        <div
                                            className={styles.scoreCircle}
                                            style={{
                                                background: `conic-gradient(var(--color-sage-500) ${session.score}%, var(--color-sage-100) 0)`,
                                            }}
                                        >
                                            <span>{session.score}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </GlassCard>
            </motion.div>

            {/* AI Insight */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.insightCard}>
                    <div className={styles.insightEmoji}>💡</div>
                    <div className={styles.insightContent}>
                        <h4>Daily Insight</h4>
                        <p>
                            {stats.currentStreak > 0
                                ? `Great job! You're on a ${stats.currentStreak}-day streak. ${stats.currentStreak >= stats.longestStreak ? "You're at your best streak!" : `${stats.longestStreak - stats.currentStreak} more days to beat your record!`}`
                                : "Start a focus session to begin building your streak!"
                            }
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}

export default Dashboard;
