'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Clock,
    Target,
    Brain,
    ChevronLeft,
    ChevronRight,
    Info,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getUserSessions, getWeeklyStats, calculateUserStats } from '@/lib/sessionService';
import { Session } from '@/lib/types';
import GlassCard from '@/components/GlassCard';
import styles from './Analytics.module.css';

interface DailyData {
    date: string;
    focusMinutes: number;
    distractedMinutes: number;
    sessions: number;
    score: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export function Analytics() {
    const { zenFocusUser } = useAuth();
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [dailyData, setDailyData] = useState<DailyData[]>([]);
    const [stats, setStats] = useState({
        totalFocusMinutes: 0,
        totalSessions: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
    });

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            if (!zenFocusUser?.id) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                // Calculate date range based on period
                const daysBack = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;

                const [sessions, userStats] = await Promise.all([
                    getUserSessions(zenFocusUser.id, daysBack),
                    calculateUserStats(zenFocusUser.id),
                ]);

                // Aggregate sessions by day
                const dailyMap = new Map<string, DailyData>();

                // Initialize days
                for (let i = daysBack - 1; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    dailyMap.set(dateStr, {
                        date: dateStr,
                        focusMinutes: 0,
                        distractedMinutes: 0,
                        sessions: 0,
                        score: 0,
                    });
                }

                // Aggregate session data
                sessions.forEach((session: Session) => {
                    const dateStr = new Date(session.startTime).toISOString().split('T')[0];
                    const existing = dailyMap.get(dateStr);
                    if (existing) {
                        existing.focusMinutes += session.totalFocusMinutes || 0;
                        existing.distractedMinutes += session.totalDistractedMinutes || 0;
                        existing.sessions++;
                        if (session.productivityScore) {
                            existing.score = existing.score ?
                                Math.round((existing.score + session.productivityScore) / 2) :
                                session.productivityScore;
                        }
                    }
                });

                // Convert to array (last 7 days for week view)
                const displayDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 52;
                const allDays = Array.from(dailyMap.values()).slice(-displayDays);

                setDailyData(allDays);
                setStats({
                    totalFocusMinutes: userStats.totalFocusMinutes,
                    totalSessions: userStats.totalSessions,
                    averageScore: userStats.averageProductivityScore,
                    currentStreak: userStats.currentStreak,
                    longestStreak: userStats.longestStreak,
                });
            } catch (error) {
                console.error('Failed to fetch analytics data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [zenFocusUser?.id, selectedPeriod]);

    // Calculate displayed totals
    const totalFocus = dailyData.reduce((sum, d) => sum + d.focusMinutes, 0);
    const totalDistracted = dailyData.reduce((sum, d) => sum + d.distractedMinutes, 0);
    const daysWithSessions = dailyData.filter(d => d.sessions > 0);
    const avgScore = daysWithSessions.length > 0
        ? Math.round(daysWithSessions.reduce((sum, d) => sum + d.score, 0) / daysWithSessions.length)
        : 0;
    const totalSessions = dailyData.reduce((sum, d) => sum + d.sessions, 0);

    // Generate insights based on data
    const generateInsights = () => {
        const insights = [];

        if (stats.currentStreak > 0) {
            insights.push({
                type: 'positive' as const,
                title: `${stats.currentStreak} Day Streak! 🔥`,
                message: stats.currentStreak >= stats.longestStreak
                    ? "You're at your best streak ever! Keep it up!"
                    : `${stats.longestStreak - stats.currentStreak} more days to beat your record of ${stats.longestStreak} days!`,
            });
        }

        if (totalFocus > 0) {
            const avgFocusPerDay = Math.round(totalFocus / dailyData.length);
            insights.push({
                type: 'neutral' as const,
                title: 'Daily Average 📊',
                message: `You're averaging ${avgFocusPerDay} minutes of focus per day this ${selectedPeriod}.`,
            });
        }

        if (avgScore > 0) {
            insights.push({
                type: avgScore >= 80 ? 'positive' as const : 'tip' as const,
                title: avgScore >= 80 ? 'Excellent Focus! ⭐' : 'Room to Improve 📈',
                message: avgScore >= 80
                    ? `Your average productivity score of ${avgScore}% is outstanding!`
                    : `Your average score is ${avgScore}%. Try longer focused sessions with fewer breaks.`,
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'tip' as const,
                title: 'Get Started! 🚀',
                message: 'Complete some focus sessions to see your analytics and insights here.',
            });
        }

        return insights;
    };

    const insights = generateInsights();

    // Date range display
    const getDateRangeLabel = () => {
        if (dailyData.length === 0) return 'No data';
        const startDate = new Date(dailyData[0].date);
        const endDate = new Date(dailyData[dailyData.length - 1].date);
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    return (
        <motion.div
            className={styles.analytics}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div className={styles.header} variants={itemVariants}>
                <div>
                    <h1>Analytics</h1>
                    <p>Understand your focus patterns and improve over time</p>
                </div>
                <div className={styles.periodSelector}>
                    {(['week', 'month', 'year'] as const).map((period) => (
                        <button
                            key={period}
                            className={`${styles.periodBtn} ${selectedPeriod === period ? styles.active : ''}`}
                            onClick={() => setSelectedPeriod(period)}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <motion.div className={styles.loadingOverlay} variants={itemVariants}>
                    <Loader2 className={styles.spinner} size={32} />
                    <span>Loading analytics...</span>
                </motion.div>
            )}

            {/* Overview Stats */}
            <div className={styles.overviewGrid}>
                <motion.div variants={itemVariants}>
                    <GlassCard className={styles.overviewCard}>
                        <div className={styles.overviewIcon}>
                            <Clock size={24} />
                        </div>
                        <div className={styles.overviewContent}>
                            <span className={styles.overviewValue}>
                                {Math.round(totalFocus / 60)}h {totalFocus % 60}m
                            </span>
                            <span className={styles.overviewLabel}>Total Focus Time</span>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard className={styles.overviewCard}>
                        <div className={styles.overviewIcon} style={{ background: 'rgba(201, 160, 138, 0.1)' }}>
                            <Target size={24} color="var(--color-terracotta)" />
                        </div>
                        <div className={styles.overviewContent}>
                            <span className={styles.overviewValue}>{avgScore || '—'}</span>
                            <span className={styles.overviewLabel}>Avg Productivity Score</span>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard className={styles.overviewCard}>
                        <div className={styles.overviewIcon} style={{ background: 'rgba(212, 207, 230, 0.1)' }}>
                            <Calendar size={24} color="var(--color-lavender)" />
                        </div>
                        <div className={styles.overviewContent}>
                            <span className={styles.overviewValue}>{totalSessions}</span>
                            <span className={styles.overviewLabel}>Sessions Completed</span>
                            <div className={styles.changeBadge} style={{ opacity: 0.7 }}>
                                ~{dailyData.length > 0 ? Math.round(totalSessions / dailyData.length) : 0} per day avg
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Focus Timeline Chart */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3>Focus Timeline</h3>
                        <div className={styles.weekNav}>
                            <span>{getDateRangeLabel()}</span>
                        </div>
                    </div>

                    {dailyData.length === 0 || totalSessions === 0 ? (
                        <div className={styles.emptyChart}>
                            <p>No sessions recorded for this period</p>
                            <p className={styles.emptyHint}>Start a focus session to see your data here!</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.timelineChart}>
                                {(selectedPeriod === 'week' ? dailyData.slice(-7) : dailyData.slice(-14)).map((day, index) => {
                                    const maxHeight = 150;
                                    const maxFocus = Math.max(...dailyData.map(d => d.focusMinutes), 60);
                                    const focusHeight = (day.focusMinutes / maxFocus) * maxHeight;
                                    const distractedHeight = (day.distractedMinutes / maxFocus) * maxHeight;
                                    const date = new Date(day.date);
                                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                    const dayNum = date.getDate();

                                    return (
                                        <div key={day.date} className={styles.timelineDay}>
                                            <div className={styles.stackedBar}>
                                                <motion.div
                                                    className={styles.focusBar}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: focusHeight }}
                                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                                />
                                                <motion.div
                                                    className={styles.distractedBar}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: distractedHeight }}
                                                    transition={{ duration: 0.5, delay: index * 0.05 + 0.1 }}
                                                />
                                            </div>
                                            <div className={styles.timelineDayLabel}>
                                                <span className={styles.dayName}>{dayName}</span>
                                                <span className={styles.dayNum}>{dayNum}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className={styles.chartLegend}>
                                <div className={styles.legendItem}>
                                    <span className={styles.legendDot} style={{ background: 'var(--color-sage-500)' }} />
                                    Focus Time
                                </div>
                                <div className={styles.legendItem}>
                                    <span className={styles.legendDot} style={{ background: 'var(--color-terracotta)' }} />
                                    Distracted
                                </div>
                            </div>
                        </>
                    )}
                </GlassCard>
            </motion.div>

            {/* Two Column Layout */}
            <div className={styles.twoColumn}>
                {/* Streak Info */}
                <motion.div variants={itemVariants}>
                    <GlassCard className={styles.peakCard}>
                        <h3>
                            <Brain size={20} />
                            Your Progress
                        </h3>
                        <div className={styles.streakInfo}>
                            <div className={styles.streakItem}>
                                <span className={styles.streakValue}>🔥 {stats.currentStreak}</span>
                                <span className={styles.streakLabel}>Current Streak</span>
                            </div>
                            <div className={styles.streakItem}>
                                <span className={styles.streakValue}>🏆 {stats.longestStreak}</span>
                                <span className={styles.streakLabel}>Longest Streak</span>
                            </div>
                            <div className={styles.streakItem}>
                                <span className={styles.streakValue}>📊 {stats.totalSessions}</span>
                                <span className={styles.streakLabel}>Total Sessions</span>
                            </div>
                            <div className={styles.streakItem}>
                                <span className={styles.streakValue}>⏱️ {(stats.totalFocusMinutes / 60).toFixed(1)}h</span>
                                <span className={styles.streakLabel}>Total Focus</span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Session Quality */}
                <motion.div variants={itemVariants}>
                    <GlassCard className={styles.distractorsCard}>
                        <h3>
                            <Info size={20} />
                            Session Quality
                        </h3>
                        <div className={styles.qualityStats}>
                            <div className={styles.qualityItem}>
                                <span className={styles.qualityLabel}>Focus Time</span>
                                <span className={styles.qualityValue} style={{ color: 'var(--color-sage-600)' }}>
                                    {totalFocus} min
                                </span>
                            </div>
                            <div className={styles.qualityItem}>
                                <span className={styles.qualityLabel}>Distracted Time</span>
                                <span className={styles.qualityValue} style={{ color: 'var(--color-terracotta)' }}>
                                    {totalDistracted} min
                                </span>
                            </div>
                            <div className={styles.qualityItem}>
                                <span className={styles.qualityLabel}>Focus Ratio</span>
                                <span className={styles.qualityValue}>
                                    {totalFocus + totalDistracted > 0
                                        ? Math.round((totalFocus / (totalFocus + totalDistracted)) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className={styles.qualityItem}>
                                <span className={styles.qualityLabel}>Avg Session Length</span>
                                <span className={styles.qualityValue}>
                                    {totalSessions > 0 ? Math.round(totalFocus / totalSessions) : 0} min
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* AI Insights */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.insightsCard}>
                    <h3>✨ AI-Powered Insights</h3>
                    <div className={styles.insightsGrid}>
                        {insights.map((insight, index) => (
                            <motion.div
                                key={index}
                                className={`${styles.insightItem} ${styles[insight.type]}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <h4>{insight.title}</h4>
                                <p>{insight.message}</p>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}

export default Analytics;
