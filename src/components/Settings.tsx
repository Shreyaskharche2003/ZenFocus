'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Bell,
    Volume2,
    Moon,
    Sun,
    Shield,
    Timer,
    Eye,
    Sliders,
    Trash2,
    Download,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import styles from './Settings.module.css';

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

interface ToggleProps {
    enabled: boolean;
    onChange: (value: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
    return (
        <motion.button
            className={`${styles.toggle} ${enabled ? styles.enabled : ''}`}
            onClick={() => onChange(!enabled)}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className={styles.toggleKnob}
                animate={{ x: enabled ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </motion.button>
    );
}

interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
}

function Slider({ value, onChange, min, max, step = 1 }: SliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={styles.sliderContainer}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={styles.slider}
                style={{
                    background: `linear-gradient(90deg, var(--color-sage-500) ${percentage}%, var(--color-sage-100) ${percentage}%)`,
                }}
            />
            <span className={styles.sliderValue}>{value}</span>
        </div>
    );
}

export function Settings() {
    const { zenFocusUser, signOut } = useAuth();

    const [preferences, setPreferences] = useState({
        theme: zenFocusUser?.preferences?.theme || 'light' as const,
        sensitivity: zenFocusUser?.preferences?.sensitivity || 0.7,
        notifications: zenFocusUser?.preferences?.notifications ?? true,
        soundsEnabled: zenFocusUser?.preferences?.soundsEnabled ?? true,
        pomodoroEnabled: zenFocusUser?.preferences?.pomodoroEnabled ?? false,
        pomodoroDuration: zenFocusUser?.preferences?.pomodoroDuration || 25,
        breakDuration: zenFocusUser?.preferences?.breakDuration || 5,
        backgroundBlur: zenFocusUser?.preferences?.backgroundBlur ?? true,
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const updatePreference = <K extends keyof typeof preferences>(key: K, value: typeof preferences[K]) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        updatePreference('theme', theme);
        // Apply theme
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <motion.div
            className={styles.settings}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div className={styles.header} variants={itemVariants}>
                <h1>Settings</h1>
                <p>Customize your ZenFocus experience</p>
            </motion.div>

            {/* Profile Section */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <User size={20} />
                        <h3>Profile</h3>
                    </div>
                    <div className={styles.profileCard}>
                        <div className={styles.avatar}>
                            {zenFocusUser?.photoURL ? (
                                <img src={zenFocusUser.photoURL} alt={zenFocusUser.displayName} />
                            ) : (
                                zenFocusUser?.displayName?.charAt(0) || 'U'
                            )}
                        </div>
                        <div className={styles.profileInfo}>
                            <span className={styles.profileName}>{zenFocusUser?.displayName || 'Focus Seeker'}</span>
                            <span className={styles.profileEmail}>{zenFocusUser?.email || 'Not signed in'}</span>
                        </div>
                        <Button variant="secondary" size="sm">Edit Profile</Button>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Appearance Section */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Sun size={20} />
                        <h3>Appearance</h3>
                    </div>
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>Theme</span>
                            <span className={styles.settingDesc}>Choose your preferred color theme</span>
                        </div>
                        <div className={styles.themeSelector}>
                            {(['light', 'dark', 'system'] as const).map((theme) => (
                                <button
                                    key={theme}
                                    className={`${styles.themeBtn} ${preferences.theme === theme ? styles.active : ''}`}
                                    onClick={() => handleThemeChange(theme)}
                                >
                                    {theme === 'light' && <Sun size={16} />}
                                    {theme === 'dark' && <Moon size={16} />}
                                    {theme === 'system' && <Sliders size={16} />}
                                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Focus Settings */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Eye size={20} />
                        <h3>Focus Detection</h3>
                    </div>

                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>Detection Sensitivity</span>
                            <span className={styles.settingDesc}>How quickly distractions are detected</span>
                        </div>
                        <Slider
                            value={Math.round(preferences.sensitivity * 10)}
                            onChange={(val) => updatePreference('sensitivity', val / 10)}
                            min={1}
                            max={10}
                        />
                    </div>

                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>Background Blur</span>
                            <span className={styles.settingDesc}>Blur background in camera for privacy</span>
                        </div>
                        <Toggle
                            enabled={preferences.backgroundBlur}
                            onChange={(val) => updatePreference('backgroundBlur', val)}
                        />
                    </div>
                </GlassCard>
            </motion.div>

            {/* Pomodoro Settings */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Timer size={20} />
                        <h3>Pomodoro Timer</h3>
                    </div>

                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>Enable Pomodoro</span>
                            <span className={styles.settingDesc}>Use timed work intervals</span>
                        </div>
                        <Toggle
                            enabled={preferences.pomodoroEnabled}
                            onChange={(val) => updatePreference('pomodoroEnabled', val)}
                        />
                    </div>

                    {preferences.pomodoroEnabled && (
                        <>
                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <span className={styles.settingLabel}>Focus Duration (minutes)</span>
                                </div>
                                <Slider
                                    value={preferences.pomodoroDuration}
                                    onChange={(val) => updatePreference('pomodoroDuration', val)}
                                    min={15}
                                    max={60}
                                    step={5}
                                />
                            </div>

                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <span className={styles.settingLabel}>Break Duration (minutes)</span>
                                </div>
                                <Slider
                                    value={preferences.breakDuration}
                                    onChange={(val) => updatePreference('breakDuration', val)}
                                    min={3}
                                    max={15}
                                />
                            </div>
                        </>
                    )}
                </GlassCard>
            </motion.div>

            {/* Notifications */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Bell size={20} />
                        <h3>Notifications & Sound</h3>
                    </div>

                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>Notifications</span>
                            <span className={styles.settingDesc}>Get gentle reminders and insights</span>
                        </div>
                        <Toggle
                            enabled={preferences.notifications}
                            onChange={(val) => updatePreference('notifications', val)}
                        />
                    </div>

                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>Sound Effects</span>
                            <span className={styles.settingDesc}>Play ambient sounds during sessions</span>
                        </div>
                        <Toggle
                            enabled={preferences.soundsEnabled}
                            onChange={(val) => updatePreference('soundsEnabled', val)}
                        />
                    </div>
                </GlassCard>
            </motion.div>

            {/* Privacy & Data */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Shield size={20} />
                        <h3>Privacy & Data</h3>
                    </div>

                    <div className={styles.privacyInfo}>
                        <p>
                            🔒 <strong>Your privacy matters.</strong> All video processing happens locally in your browser.
                            We never upload or store your camera feed. Only anonymized focus metrics are saved.
                        </p>
                    </div>

                    <div className={styles.dataActions}>
                        <Button variant="secondary" icon={<Download size={18} />}>
                            Export My Data
                        </Button>
                        <Button
                            variant="ghost"
                            icon={<Trash2 size={18} />}
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            Delete All Data
                        </Button>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Sign Out */}
            <motion.div variants={itemVariants}>
                <GlassCard className={styles.section}>
                    <div className={styles.signOutRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>Sign Out</span>
                            <span className={styles.settingDesc}>Sign out of your ZenFocus account</span>
                        </div>
                        <Button
                            variant="secondary"
                            icon={<LogOut size={18} />}
                            onClick={handleSignOut}
                            loading={isSigningOut}
                        >
                            Sign Out
                        </Button>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Version Info */}
            <motion.div className={styles.versionInfo} variants={itemVariants}>
                <p>ZenFocus v1.0.0</p>
                <p>Made with 💚 for mindful productivity</p>
            </motion.div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <motion.div
                    className={styles.modal}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={styles.modalContent}
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                    >
                        <h3>Delete All Data?</h3>
                        <p>This action cannot be undone. All your sessions, statistics, and preferences will be permanently deleted.</p>
                        <div className={styles.modalActions}>
                            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={() => setShowDeleteConfirm(false)}>
                                Delete Everything
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default Settings;
