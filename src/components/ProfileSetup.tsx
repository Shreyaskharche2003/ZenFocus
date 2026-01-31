'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import {
    Sparkles,
    Brain,
    Shield,
    TrendingUp,
    BarChart3,
    Target,
    Clock,
    ArrowRight,
    Check,
} from 'lucide-react';
import styles from './ProfileSetup.module.css';

const professions = [
    'Student',
    'Software Engineer',
    'Designer',
    'Writer',
    'Researcher',
    'Entrepreneur',
    'Teacher',
    'Healthcare Professional',
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

export function ProfileSetup() {
    const { updateUserProfile, zenFocusUser } = useAuth();

    const [step, setStep] = useState(1);
    const [gender, setGender] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [profession, setProfession] = useState<string>('');
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [dailyGoal, setDailyGoal] = useState<number>(60);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleGoal = (goalId: string) => {
        setSelectedGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(g => g !== goalId)
                : [...prev, goalId]
        );
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            // Only include values that are actually set
            const profileData: Record<string, any> = {
                dailyFocusGoal: dailyGoal,
            };

            if (gender) profileData.gender = gender;
            if (age) profileData.age = parseInt(age);
            if (profession) profileData.profession = profession;
            if (selectedGoals.length > 0) profileData.goals = selectedGoals;

            await updateUserProfile(profileData);
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        await updateUserProfile({});
    };

    return (
        <div className={styles.container}>
            <div className={styles.backgroundEffects}>
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

            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Sparkles size={24} />
                    </div>
                    <h1>Welcome, {zenFocusUser?.displayName?.split(' ')[0] || 'Friend'}!</h1>
                    <p>Let&apos;s personalize your experience</p>
                </div>

                {/* Progress indicator */}
                <div className={styles.progress}>
                    {[1, 2, 3].map(s => (
                        <div
                            key={s}
                            className={`${styles.progressDot} ${step >= s ? styles.active : ''}`}
                        />
                    ))}
                </div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <motion.div
                        className={styles.stepContent}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2>Tell us about yourself</h2>

                        <div className={styles.formGroup}>
                            <label>Gender (optional)</label>
                            <div className={styles.optionGrid}>
                                {['male', 'female', 'other', 'prefer-not-to-say'].map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        className={`${styles.optionBtn} ${gender === g ? styles.selected : ''}`}
                                        onClick={() => setGender(g)}
                                    >
                                        {g === 'prefer-not-to-say' ? 'Prefer not to say' : g.charAt(0).toUpperCase() + g.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

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

                        <button
                            className={styles.nextBtn}
                            onClick={() => setStep(2)}
                        >
                            Continue
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}

                {/* Step 2: Goals */}
                {step === 2 && (
                    <motion.div
                        className={styles.stepContent}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2>What are your goals?</h2>
                        <p className={styles.stepDesc}>Select all that apply</p>

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
                                        <Icon size={20} />
                                        <span>{goal.label}</span>
                                        {isSelected && <Check size={18} className={styles.checkIcon} />}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className={styles.btnRow}>
                            <button className={styles.backBtn} onClick={() => setStep(1)}>
                                Back
                            </button>
                            <button className={styles.nextBtn} onClick={() => setStep(3)}>
                                Continue
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Daily Goal */}
                {step === 3 && (
                    <motion.div
                        className={styles.stepContent}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2>Set your daily goal</h2>
                        <p className={styles.stepDesc}>How much time do you want to focus each day?</p>

                        <div className={styles.goalDisplay}>
                            <motion.span
                                key={dailyGoal}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={styles.goalValue}
                            >
                                {dailyGoal}
                            </motion.span>
                            <span className={styles.goalUnit}>minutes/day</span>
                        </div>

                        <div className={styles.sliderContainer}>
                            <input
                                type="range"
                                min="15"
                                max="240"
                                step="15"
                                value={dailyGoal}
                                onChange={(e) => setDailyGoal(Number(e.target.value))}
                                className={styles.slider}
                            />
                            <div className={styles.sliderLabels}>
                                <span>15m</span>
                                <span>1h</span>
                                <span>2h</span>
                                <span>3h</span>
                                <span>4h</span>
                            </div>
                        </div>

                        <div className={styles.goalSuggestions}>
                            {[30, 60, 90, 120].map(val => (
                                <button
                                    key={val}
                                    className={`${styles.suggestionBtn} ${dailyGoal === val ? styles.active : ''}`}
                                    onClick={() => setDailyGoal(val)}
                                >
                                    {val}m
                                </button>
                            ))}
                        </div>

                        <div className={styles.btnRow}>
                            <button className={styles.backBtn} onClick={() => setStep(2)}>
                                Back
                            </button>
                            <motion.button
                                className={styles.startBtn}
                                onClick={handleComplete}
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSubmitting ? 'Setting up...' : 'Start Focusing!'}
                                <Sparkles size={18} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                <button className={styles.skipBtn} onClick={handleSkip}>
                    Skip for now
                </button>
            </motion.div>
        </div>
    );
}

export default ProfileSetup;
