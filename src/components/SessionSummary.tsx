'use client';

import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    Zap,
    Brain,
    Target,
    ArrowRight,
    Calendar,
    Award
} from 'lucide-react';
import { Session } from '@/lib/types';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import styles from './SessionSummary.module.css';

interface SessionSummaryProps {
    session: Session;
    onClose: () => void;
}

export default function SessionSummary({ session, onClose }: SessionSummaryProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className={styles.container}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
            >
                <GlassCard className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.iconContainer}>
                            <Award className={styles.mainIcon} size={48} />
                        </div>
                        <h2>Session Complete!</h2>
                        <p className={styles.date}>{formatDate(session.startTime)}</p>
                    </div>

                    <div className={styles.scoreSection}>
                        <div className={styles.scoreCircle}>
                            <svg viewBox="0 0 100 100">
                                <circle
                                    className={styles.scoreBg}
                                    cx="50" cy="50" r="45"
                                />
                                <motion.circle
                                    className={styles.scoreFill}
                                    cx="50" cy="50" r="45"
                                    initial={{ strokeDasharray: "0 283" }}
                                    animate={{ strokeDasharray: `${(session.productivityScore || 0) * 2.83} 283` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            <div className={styles.scoreText}>
                                <span className={styles.scoreValue}>{session.productivityScore}</span>
                                <span className={styles.scoreLabel}>Score</span>
                            </div>
                        </div>
                        <p className={styles.scoreDescription}>
                            {session.productivityScore && session.productivityScore > 80
                                ? "Outstanding focus! You were in the zone."
                                : session.productivityScore && session.productivityScore > 60
                                    ? "Great job. You stayed productive for most of the session."
                                    : "A good start. Every minute of focus counts!"}
                        </p>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <Clock className={styles.statIcon} size={20} />
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Focus Time</span>
                                <span className={styles.statValue}>{session.totalFocusMinutes}m</span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <Zap className={styles.statIcon} size={20} />
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Distractions</span>
                                <span className={styles.statValue}>{session.distractionCount}</span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <Brain className={styles.statIcon} size={20} />
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Distracted Time</span>
                                <span className={styles.statValue}>{session.totalDistractedMinutes}m</span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <Target className={styles.statIcon} size={20} />
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Efficiency</span>
                                <span className={styles.statValue}>
                                    {session.totalFocusMinutes + session.totalDistractedMinutes > 0
                                        ? Math.round((session.totalFocusMinutes / (session.totalFocusMinutes + session.totalDistractedMinutes)) * 100)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button
                            onClick={onClose}
                            size="lg"
                            fullWidth
                            icon={<ArrowRight size={20} />}
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}
