'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    label?: string;
    sublabel?: string;
    color?: string;
    backgroundColor?: string;
    animated?: boolean;
}

export function ProgressRing({
    progress,
    size = 200,
    strokeWidth = 12,
    label,
    sublabel,
    color = 'var(--color-sage-500)',
    backgroundColor = 'var(--color-sage-100)',
    animated = true,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="progress-ring-container" style={{ width: size, height: size, position: 'relative' }}>
            <svg
                width={size}
                height={size}
                style={{ transform: 'rotate(-90deg)' }}
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
                    style={{
                        filter: 'drop-shadow(0 0 8px rgba(122, 139, 104, 0.3))',
                    }}
                />
            </svg>
            {/* Center content */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                }}
            >
                {label && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: size * 0.2,
                            fontWeight: 600,
                            color: 'var(--color-sage-800)',
                            lineHeight: 1,
                        }}
                    >
                        {label}
                    </motion.div>
                )}
                {sublabel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: size * 0.07,
                            color: 'var(--color-sage-500)',
                            marginTop: 4,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        {sublabel}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default ProgressRing;
