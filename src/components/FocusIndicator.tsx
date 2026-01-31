'use client';

import { motion } from 'framer-motion';
import { FocusState } from '@/lib/types';

interface FocusIndicatorProps {
    state: FocusState;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    animated?: boolean;
}

const stateConfig: Record<FocusState, { color: string; label: string; bgColor: string }> = {
    FOCUSED: {
        color: 'var(--color-focus)',
        label: 'Deep Focus',
        bgColor: 'rgba(122, 139, 104, 0.15)',
    },
    DISTRACTED: {
        color: 'var(--color-distracted)',
        label: 'Distracted',
        bgColor: 'rgba(201, 160, 138, 0.15)',
    },
    IDLE: {
        color: 'var(--color-idle)',
        label: 'Idle',
        bgColor: 'rgba(212, 207, 230, 0.15)',
    },
    SLEEPING: {
        color: 'var(--color-sleeping)',
        label: 'Resting',
        bgColor: 'rgba(156, 163, 175, 0.15)',
    },
    AWAY: {
        color: '#94a3b8',
        label: 'Away',
        bgColor: 'rgba(148, 163, 184, 0.15)',
    },
};

const sizeConfig = {
    sm: { dot: 10, padding: 8, fontSize: 12 },
    md: { dot: 14, padding: 12, fontSize: 14 },
    lg: { dot: 18, padding: 16, fontSize: 16 },
};

export function FocusIndicator({
    state,
    size = 'md',
    showLabel = true,
    animated = true,
}: FocusIndicatorProps) {
    const config = stateConfig[state];
    const sizes = sizeConfig[size];

    return (
        <motion.div
            initial={animated ? { opacity: 0, scale: 0.9 } : false}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: sizes.padding / 2,
                padding: `${sizes.padding / 2}px ${sizes.padding}px`,
                backgroundColor: config.bgColor,
                borderRadius: 'var(--radius-full)',
                backdropFilter: 'blur(10px)',
            }}
        >
            {/* Animated dot */}
            <motion.div
                animate={
                    animated && state === 'FOCUSED'
                        ? {
                            scale: [1, 1.2, 1],
                            opacity: [0.8, 1, 0.8],
                        }
                        : {}
                }
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    width: sizes.dot,
                    height: sizes.dot,
                    borderRadius: '50%',
                    backgroundColor: config.color,
                    boxShadow: `0 0 ${sizes.dot}px ${config.color}`,
                }}
            />

            {showLabel && (
                <span
                    style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: sizes.fontSize,
                        fontWeight: 500,
                        color: config.color,
                        letterSpacing: '0.02em',
                    }}
                >
                    {config.label}
                </span>
            )}
        </motion.div>
    );
}

export default FocusIndicator;
