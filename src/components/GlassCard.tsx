'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './GlassCard.module.css';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    onClick?: () => void;
    style?: React.CSSProperties;
}

const paddingMap = {
    none: '0',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
};

export function GlassCard({
    children,
    className = '',
    padding = 'lg',
    hover = true,
    onClick,
    style,
}: GlassCardProps) {
    return (
        <motion.div
            className={`${styles.card} ${hover ? styles.hoverable : ''} ${className}`}
            whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            onClick={onClick}
            style={{
                padding: paddingMap[padding],
                cursor: onClick ? 'pointer' : 'default',
                ...style,
            }}
        >
            {children}
        </motion.div>
    );
}

export default GlassCard;
