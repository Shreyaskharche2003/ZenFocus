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
    const { signInWithGoogle, loading } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            // Don't show error if user just closed the popup
            if (err?.code === 'auth/popup-closed-by-user') {
                // User closed the popup, no action needed
                console.log('Sign-in popup was closed');
            } else if (err?.code === 'auth/cancelled-popup-request') {
                // Another popup was opened, ignore
                console.log('Popup request cancelled');
            } else if (err?.code === 'auth/network-request-failed') {
                setError('Network error. Please check your internet connection.');
            } else if (err?.code === 'auth/popup-blocked') {
                setError('Popup was blocked. Please allow popups for this site.');
            } else {
                setError('Failed to sign in. Please try again.');
                console.error('Sign-in error:', err);
            }
        } finally {
            setIsSigningIn(false);
        }
    };

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

                    <motion.button
                        className={styles.googleButton}
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn || loading}
                        whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isSigningIn ? (
                            <motion.div
                                className={styles.spinner}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                        ) : (
                            <>
                                <svg className={styles.googleIcon} viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </motion.button>

                    <p className={styles.terms}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
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
