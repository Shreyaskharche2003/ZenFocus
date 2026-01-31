'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import {
    Sparkles,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Brain,
    Shield,
    TrendingUp,
    Clock,
    Target,
    Zap,
    BarChart3,
    Heart,
    Check,
} from 'lucide-react';
import styles from './AuthPage.module.css';

type AuthMode = 'login' | 'register' | 'profile-setup';

const productFeatures = [
    {
        icon: Brain,
        title: 'AI-Powered Tracking',
        description: 'Real-time focus detection using advanced computer vision',
        color: '#7A8B68',
    },
    {
        icon: Shield,
        title: '100% Private',
        description: 'All processing happens locally - your data never leaves your device',
        color: '#C9A08A',
    },
    {
        icon: TrendingUp,
        title: 'Smart Analytics',
        description: 'Discover patterns and optimize your productivity',
        color: '#B8D4E3',
    },
    {
        icon: Heart,
        title: 'Mindful Design',
        description: 'Calming interface designed for peaceful productivity',
        color: '#D4CFE6',
    },
];

const stats = [
    { value: 'BETA', label: 'Early Access' },
    { value: '100%', label: 'Local Privacy' },
    { value: 'AI', label: 'Vision Engine' },
    { value: 'V1.0', label: 'Open Release' },
];

const testimonials = [
    {
        quote: "Built for those who value deep work and digital minimalism.",
        author: "ZenFocus Mission",
        role: "Project Core",
    },
    {
        quote: "Your privacy is a feature, not an afterthought.",
        author: "Local First AI",
        role: "Architecture",
    },
];

const professions = [
    'Student',
    'Software Engineer',
    'Designer',
    'Writer',
    'Researcher',
    'Entrepreneur',
    'Teacher',
    'Healthcare',
    'Marketing',
    'Finance',
    'Other',
];

const goals = [
    { id: 'deep-work', label: 'More deep work sessions', icon: Brain },
    { id: 'less-distraction', label: 'Reduce distractions', icon: Shield },
    { id: 'study-better', label: 'Study more effectively', icon: TrendingUp },
    { id: 'track-progress', label: 'Track my progress', icon: BarChart3 },
    { id: 'build-habits', label: 'Build focus habits', icon: Target },
    { id: 'work-life-balance', label: 'Better work-life balance', icon: Clock },
];

export function AuthPage() {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, updateUserProfile, loading } = useAuth();

    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Profile setup
    const [gender, setGender] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [profession, setProfession] = useState<string>('');
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [dailyGoal, setDailyGoal] = useState<number>(60);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (mode === 'register') {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setIsSubmitting(false);
                    return;
                }
                if (password.length < 6) {
                    setError('Password must be at least 6 characters');
                    setIsSubmitting(false);
                    return;
                }
                await signUpWithEmail(email, password, displayName);
                setMode('profile-setup');
            } else {
                await signInWithEmail(email, password);
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            console.error('Error code:', err?.code);
            console.error('Error message:', err?.message);

            if (err?.code === 'auth/user-not-found') {
                setError('No account found with this email');
            } else if (err?.code === 'auth/wrong-password') {
                setError('Incorrect password');
            } else if (err?.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists');
            } else if (err?.code === 'auth/invalid-email') {
                setError('Please enter a valid email address');
            } else if (err?.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
            } else if (err?.code === 'auth/operation-not-allowed') {
                setError('Email/password sign-in is not enabled. Please enable it in Firebase Console.');
            } else if (err?.code === 'auth/weak-password') {
                setError('Password is too weak. Please use a stronger password.');
            } else {
                setError(`Error: ${err?.code || err?.message || 'Unknown error'}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            if (err?.code !== 'auth/popup-closed-by-user' &&
                err?.code !== 'auth/cancelled-popup-request') {
                setError('Google sign-in failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProfileSetup = async () => {
        setIsSubmitting(true);
        try {
            await updateUserProfile({
                gender: gender as any,
                age: age ? parseInt(age) : undefined,
                profession,
                goals: selectedGoals,
                dailyFocusGoal: dailyGoal,
            });
        } catch (err) {
            setError('Failed to save profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleGoal = (goalId: string) => {
        setSelectedGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(g => g !== goalId)
                : [...prev, goalId]
        );
    };

    return (
        <div className={styles.container}>
            {/* Left Panel - Product Showcase */}
            <div className={styles.showcasePanel}>
                <div className={styles.showcaseBg}>
                    <motion.div
                        className={styles.orb1}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 8, repeat: Infinity }}
                    />
                    <motion.div
                        className={styles.orb2}
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 10, repeat: Infinity }}
                    />
                </div>

                <div className={styles.showcaseContent}>
                    <motion.div
                        className={styles.brandLogo}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                    >
                        <Sparkles size={32} />
                    </motion.div>

                    <motion.h1
                        className={styles.brandTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        ZenFocus
                    </motion.h1>

                    <motion.p
                        className={styles.brandTagline}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        AI-Powered Focus Tracking for Mindful Productivity
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        className={styles.statsRow}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className={styles.stat}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <span className={styles.statValue}>{stat.value}</span>
                                <span className={styles.statLabel}>{stat.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Features Grid */}
                    <div className={styles.featuresGrid}>
                        {productFeatures.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={i}
                                    className={styles.featureCard}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                >
                                    <div
                                        className={styles.featureIcon}
                                        style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <div className={styles.featureText}>
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Testimonial */}
                    <motion.div
                        className={styles.testimonial}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <blockquote>&quot;{testimonials[0].quote}&quot;</blockquote>
                        <cite>— {testimonials[0].author}, {testimonials[0].role}</cite>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Auth Forms */}
            <div className={styles.authPanel}>
                <AnimatePresence mode="wait">
                    {mode === 'profile-setup' ? (
                        <motion.div
                            key="profile"
                            className={styles.authCard}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <button
                                className={styles.backBtn}
                                onClick={() => setMode('register')}
                            >
                                <ArrowLeft size={18} />
                                Back
                            </button>

                            <h2 className={styles.authTitle}>Complete Your Profile</h2>
                            <p className={styles.authSubtitle}>Help us personalize your experience</p>

                            <div className={styles.profileForm}>
                                {/* Gender */}
                                <div className={styles.formGroup}>
                                    <label>Gender (optional)</label>
                                    <div className={styles.genderOptions}>
                                        {['male', 'female', 'other', 'prefer-not-to-say'].map(g => (
                                            <button
                                                key={g}
                                                type="button"
                                                className={`${styles.genderBtn} ${gender === g ? styles.selected : ''}`}
                                                onClick={() => setGender(g)}
                                            >
                                                {g === 'prefer-not-to-say' ? 'Prefer not to say' : g.charAt(0).toUpperCase() + g.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Age */}
                                <div className={styles.formGroup}>
                                    <label>Age (optional)</label>
                                    <input
                                        type="number"
                                        placeholder="Your age"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        min="10"
                                        max="100"
                                        className={styles.input}
                                    />
                                </div>

                                {/* Profession */}
                                <div className={styles.formGroup}>
                                    <label>What do you do?</label>
                                    <select
                                        value={profession}
                                        onChange={(e) => setProfession(e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="">Select your profession</option>
                                        {professions.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Goals */}
                                <div className={styles.formGroup}>
                                    <label>What are your goals?</label>
                                    <div className={styles.goalsGrid}>
                                        {goals.map(goal => {
                                            const Icon = goal.icon;
                                            const isSelected = selectedGoals.includes(goal.id);
                                            return (
                                                <motion.button
                                                    key={goal.id}
                                                    type="button"
                                                    className={`${styles.goalBtn} ${isSelected ? styles.selected : ''}`}
                                                    onClick={() => toggleGoal(goal.id)}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <Icon size={18} />
                                                    <span>{goal.label}</span>
                                                    {isSelected && <Check size={16} className={styles.checkIcon} />}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Daily Goal */}
                                <div className={styles.formGroup}>
                                    <label>Daily focus goal: {dailyGoal} minutes</label>
                                    <input
                                        type="range"
                                        min="15"
                                        max="240"
                                        step="15"
                                        value={dailyGoal}
                                        onChange={(e) => setDailyGoal(Number(e.target.value))}
                                        className={styles.rangeSlider}
                                    />
                                    <div className={styles.rangeLabels}>
                                        <span>15m</span>
                                        <span>4h</span>
                                    </div>
                                </div>

                                <motion.button
                                    className={styles.primaryBtn}
                                    onClick={handleProfileSetup}
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isSubmitting ? 'Saving...' : 'Start Focusing'}
                                    <ArrowRight size={18} />
                                </motion.button>

                                <button
                                    className={styles.skipBtn}
                                    onClick={() => updateUserProfile({})}
                                >
                                    Skip for now
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="auth"
                            className={styles.authCard}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {/* Mobile Logo */}
                            <div className={styles.mobileLogo}>
                                <div className={styles.brandLogoSmall}>
                                    <Sparkles size={24} />
                                </div>
                                <span>ZenFocus</span>
                            </div>

                            <h2 className={styles.authTitle}>
                                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className={styles.authSubtitle}>
                                {mode === 'login'
                                    ? 'Sign in to continue your focus journey'
                                    : 'Join our journey to better focus'}
                            </p>

                            {error && (
                                <motion.div
                                    className={styles.error}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleEmailAuth} className={styles.authForm}>
                                {mode === 'register' && (
                                    <div className={styles.inputGroup}>
                                        <User size={18} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                )}

                                <div className={styles.inputGroup}>
                                    <Mail size={18} className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <Lock size={18} className={styles.inputIcon} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={styles.input}
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeBtn}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {mode === 'register' && (
                                    <div className={styles.inputGroup}>
                                        <Lock size={18} className={styles.inputIcon} />
                                        <input
                                            type="password"
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                )}

                                <motion.button
                                    type="submit"
                                    className={styles.primaryBtn}
                                    disabled={isSubmitting || loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isSubmitting
                                        ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                                        : (mode === 'login' ? 'Sign In' : 'Create Account')
                                    }
                                    <ArrowRight size={18} />
                                </motion.button>
                            </form>

                            <div className={styles.divider}>
                                <span>or continue with</span>
                            </div>

                            <motion.button
                                className={styles.googleBtn}
                                onClick={handleGoogleAuth}
                                disabled={isSubmitting || loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg viewBox="0 0 24 24" className={styles.googleIcon}>
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </motion.button>

                            <p className={styles.switchMode}>
                                {mode === 'login' ? (
                                    <>Don&apos;t have an account? <button onClick={() => { setMode('register'); setError(null); }}>Sign up</button></>
                                ) : (
                                    <>Already have an account? <button onClick={() => { setMode('login'); setError(null); }}>Sign in</button></>
                                )}
                            </p>

                            <p className={styles.terms}>
                                By continuing, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default AuthPage;
