'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User as ZenFocusUser, UserPreferences, UserStats } from '@/lib/types';
import { sendWelcomeEmail } from '@/lib/welcomeEmail';

export interface UserProfile {
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    age?: number;
    profession?: string;
    goals?: string[];
    dailyFocusGoal?: number; // in minutes
}

interface AuthContextType {
    user: User | null;
    zenFocusUser: ZenFocusUser | null;
    loading: boolean;

    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (profile: UserProfile) => Promise<void>;
    signOut: () => Promise<void>;
    needsProfileSetup: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
    theme: 'light',
    sensitivity: 0.7,
    notifications: true,
    soundsEnabled: true,
    pomodoroEnabled: false,
    pomodoroDuration: 25,
    breakDuration: 5,
    backgroundBlur: true,
};

const defaultStats: UserStats = {
    totalFocusMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    averageProductivityScore: 0,
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [zenFocusUser, setZenFocusUser] = useState<ZenFocusUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

    // Handle user data creation/fetching with timeout
    const handleUserData = async (firebaseUser: User, isNewUser: boolean = false) => {
        const fallbackUser: ZenFocusUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Focus Seeker',
            preferences: defaultPreferences,
            stats: defaultStats,
            createdAt: Date.now(),
        };
        if (firebaseUser.photoURL) {
            fallbackUser.photoURL = firebaseUser.photoURL;
        }

        try {
            console.log('📝 handleUserData called for:', firebaseUser.email, 'uid:', firebaseUser.uid);

            // Timeout wrapper - Firestore can hang if rules block the request
            const firestoreWithTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
                return Promise.race([
                    promise,
                    new Promise<T>((_, reject) =>
                        setTimeout(() => reject(new Error('Firestore timeout')), ms)
                    )
                ]);
            };

            const userDocRef = doc(db, 'users', firebaseUser.uid);

            console.log('📝 Fetching user doc from Firestore...');
            const userDoc = await firestoreWithTimeout(getDoc(userDocRef), 5000);
            console.log('📝 User doc exists:', userDoc.exists());

            if (userDoc.exists()) {
                const userData = userDoc.data() as ZenFocusUser;
                console.log('✅ Existing user loaded:', userData.displayName);
                setZenFocusUser(userData);
                setNeedsProfileSetup(!userData.profile?.profession);
            } else {
                console.log('📝 Creating new user document...');
                const newUser: Record<string, any> = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || 'Focus Seeker',
                    preferences: defaultPreferences,
                    stats: defaultStats,
                    createdAt: Date.now(),
                };

                if (firebaseUser.photoURL) {
                    newUser.photoURL = firebaseUser.photoURL;
                }

                try {
                    await firestoreWithTimeout(setDoc(userDocRef, newUser), 5000);
                    console.log('✅ New user document created in Firestore');
                } catch (writeErr) {
                    console.warn('⚠️ Could not write user doc to Firestore:', writeErr);
                }

                setZenFocusUser(newUser as ZenFocusUser);
                setNeedsProfileSetup(true);

                // Send welcome/verification email (non-blocking)
                if (firebaseUser.email) {
                    sendWelcomeEmail(firebaseUser.email, newUser.displayName, firebaseUser);
                }
            }
        } catch (error: any) {
            console.error('❌ Error handling user data:', error?.message || error);
            console.log('⚠️ Using fallback user data');
            setZenFocusUser(fallbackUser);
            setNeedsProfileSetup(true);
        }
    };

    useEffect(() => {
        console.log('🔵 AuthContext: Initializing...');

        // Safety timeout - never stay stuck on loading
        const safetyTimeout = setTimeout(() => {
            setLoading(prev => {
                if (prev) {
                    console.warn('⚠️ Auth loading timeout reached - forcing load complete');
                    return false;
                }
                return prev;
            });
        }, 10000);

        // Check for redirect result (legacy cleanup)
        // No longer using Google sign-in

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('🔵 Auth state changed:', firebaseUser?.email || 'null', 'uid:', firebaseUser?.uid || 'none');
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    await handleUserData(firebaseUser);
                } catch (e) {
                    console.error('❌ handleUserData failed in onAuthStateChanged:', e);
                }
            } else {
                setZenFocusUser(null);
                setNeedsProfileSetup(false);
            }

            console.log('✅ Auth loading complete');
            setLoading(false);
            clearTimeout(safetyTimeout);
        });

        return () => {
            unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, []);


    const signInWithEmail = async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await handleUserData(result.user);
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        await handleUserData(result.user, true);
    };

    const resetPassword = async (email: string) => {
        console.log('🔵 Sending password reset email to:', email);
        try {
            await sendPasswordResetEmail(auth, email, {
                url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
                handleCodeInApp: false,
            });
            console.log('✅ Password reset email sent successfully to:', email);
        } catch (error: any) {
            console.error('❌ Password reset failed:', error?.code, error?.message);
            throw error; // Re-throw so AuthPage can show the error
        }
    };

    const updateUserProfile = async (profile: UserProfile) => {
        if (!user) return;

        try {
            const userDocRef = doc(db, 'users', user.uid);

            // Filter out undefined values - Firestore doesn't accept them
            const cleanProfile: Record<string, any> = {};
            Object.entries(profile).forEach(([key, value]) => {
                if (value !== undefined) {
                    cleanProfile[key] = value;
                }
            });

            await updateDoc(userDocRef, { profile: cleanProfile });

            if (zenFocusUser) {
                setZenFocusUser({ ...zenFocusUser, profile: cleanProfile });
            }
            setNeedsProfileSetup(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            // If update fails, still let user proceed
            setNeedsProfileSetup(false);
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setZenFocusUser(null);
        setNeedsProfileSetup(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            zenFocusUser,
            loading,

            signInWithEmail,
            signUpWithEmail,
            resetPassword,
            updateUserProfile,
            signOut,
            needsProfileSetup,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
