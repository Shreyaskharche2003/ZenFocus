'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
    type?: 'button' | 'submit';
    className?: string;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    onClick,
    type = 'button',
    className = '',
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <motion.button
            type={type}
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
            onClick={onClick}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.02, y: -2 } : undefined}
            whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        >
            {loading ? (
                <motion.div
                    className={styles.spinner}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>}
                    <span>{children}</span>
                    {icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
                </>
            )}
        </motion.button>
    );
}

export default Button;
