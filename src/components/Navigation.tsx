'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Target, BarChart3, Settings, User, Flame } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './Navigation.module.css';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/focus', icon: Target, label: 'Focus' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
    const pathname = usePathname();
    const { zenFocusUser } = useAuth();

    return (
        <motion.nav
            className={styles.nav}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <motion.div
                        className={styles.logoIcon}
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Flame size={24} strokeWidth={2.5} />
                    </motion.div>
                    <span className={styles.logoText}>ZenFocus</span>
                </Link>

                {/* Navigation Links */}
                <div className={styles.links}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link key={item.href} href={item.href} className={styles.linkWrapper}>
                                <motion.div
                                    className={`${styles.link} ${isActive ? styles.active : ''}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Icon size={20} />
                                    <span className={styles.linkLabel}>{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            className={styles.activeIndicator}
                                            layoutId="activeNav"
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                {/* User Avatar */}
                <Link href="/settings">
                    <motion.div
                        className={styles.avatar}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {zenFocusUser?.photoURL ? (
                            <img
                                src={zenFocusUser.photoURL}
                                alt={zenFocusUser.displayName || 'User'}
                            />
                        ) : (
                            <User size={20} />
                        )}
                    </motion.div>
                </Link>
            </div>
        </motion.nav>
    );
}

export default Navigation;
