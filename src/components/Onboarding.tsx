'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import {
    Sparkles,
    Target,
    Shield,
    Brain,
    TrendingUp,
    ArrowRight,
    Check,
} from 'lucide-react';
import Button from '@/components/Button';
import styles from './Onboarding.module.css';

const features = [
    {
        icon: Brain,
        title: 'AI-Powered Focus Tracking',
        description: 'Our AI understands when you\'re focused, distracted, or need a break - all processed locally for privacy.',
    },
    {
        icon: Shield,
        title: 'Privacy First',
        description: 'Your camera feed never leaves your device. All analysis happens right in your browser.',
    },
    {
        icon: TrendingUp,
        title: 'Insightful Analytics',
        description: 'Discover your peak productivity hours and get personalized tips to improve focus.',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const floatingVariants = {
    animate: {
        y: [-10, 10, -10],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1] as const,
        },
    },
};

export function Onboarding() {
    const { loading } = useAuth();
    const [isSigningIn] = useState(false);
    const [error] = useState<string | null>(null);

    return (
        <div className={styles.container}>
            {/* Animated background elements */}
            <div className={styles.backgroundEffects}>
                <motion.div
                    className={styles.orb1}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className={styles.orb2}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className={styles.orb3}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.25, 0.45, 0.25],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <motion.div
                className={styles.content}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Logo & Hero */}
                <motion.div className={styles.hero} variants={itemVariants}>
                    <motion.div
                        className={styles.logoContainer}
                        variants={floatingVariants}
                        animate="animate"
                    >
                        <div className={styles.logo}>
                            <Sparkles size={32} />
                        </div>
                    </motion.div>

                    <motion.h1 className={styles.title} variants={itemVariants}>
                        Welcome to{' '}
                        <span className={styles.titleHighlight}>ZenFocus</span>
                    </motion.h1>

                    <motion.p className={styles.subtitle} variants={itemVariants}>
                        Your AI companion for mindful productivity. Track your focus,
                        understand your patterns, and achieve deep work.
                    </motion.p>
                </motion.div>

                {/* Features */}
                <motion.div className={styles.features} variants={itemVariants}>
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                className={styles.featureCard}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.15, duration: 0.5 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className={styles.featureIcon}>
                                    <Icon size={24} />
                                </div>
                                <div className={styles.featureContent}>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </div>
                                <div className={styles.featureCheck}>
                                    <Check size={16} />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* CTA Section */}
                <motion.div className={styles.ctaSection} variants={itemVariants}>
                    {error && (
                        <motion.div
                            className={styles.error}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <p className={styles.terms}>
                        Sign in with your email to get started.
                    </p>
                </motion.div>

                {/* Trust badges */}
                <motion.div className={styles.trustSection} variants={itemVariants}>
                    <div className={styles.trustBadge}>
                        <Shield size={16} />
                        <span>Privacy Protected</span>
                    </div>
                    <div className={styles.trustBadge}>
                        <Target size={16} />
                        <span>100% Local Processing</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* Decorative bottom wave */}
            <div className={styles.bottomWave}>
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                        fill="rgba(122, 139, 104, 0.08)"
                    />
                </svg>
            </div>
        </div>
    );
}

export default Onboarding;
