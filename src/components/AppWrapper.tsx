'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import AuthPage from '@/components/AuthPage';
import ProfileSetup from '@/components/ProfileSetup';
import styles from './AppWrapper.module.css';

interface AppWrapperProps {
    children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
    const { user, needsProfileSetup, loading } = useAuth();

    // Loading state
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <motion.div
                    className={styles.loader}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <div className={styles.loaderInner} />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Loading ZenFocus...
                </motion.p>
            </div>
        );
    }

    // Not authenticated - show auth page
    if (!user) {
        return <AuthPage />;
    }

    // Need profile setup
    if (needsProfileSetup) {
        return <ProfileSetup />;
    }

    // Authenticated - show app
    return <>{children}</>;
}

export default AppWrapper;
