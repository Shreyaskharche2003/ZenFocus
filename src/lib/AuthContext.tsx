'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { User as ZenFocusUser, UserPreferences, UserStats } from '@/lib/types';

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
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
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

    // Handle user data creation/fetching
    const handleUserData = async (firebaseUser: User, isNewUser: boolean = false) => {
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data() as ZenFocusUser;
                setZenFocusUser(userData);
                // Check if profile is complete
                setNeedsProfileSetup(!userData.profile?.profession);
            } else {
                // Create new user document - Firestore doesn't accept undefined
                const newUser: Record<string, any> = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || 'Focus Seeker',
                    preferences: defaultPreferences,
                    stats: defaultStats,
                    createdAt: Date.now(),
                };

                // Only add photoURL if it exists
                if (firebaseUser.photoURL) {
                    newUser.photoURL = firebaseUser.photoURL;
                }

                await setDoc(userDocRef, newUser);
                setZenFocusUser(newUser as ZenFocusUser);
                setNeedsProfileSetup(true);
            }
        } catch (error) {
            console.error('Error handling user data:', error);
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
            setZenFocusUser(fallbackUser);
            if (isNewUser) setNeedsProfileSetup(true);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                await handleUserData(firebaseUser);
            } else {
                setZenFocusUser(null);
                setNeedsProfileSetup(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        await handleUserData(result.user);
    };

    const signInWithEmail = async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await handleUserData(result.user);
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        await handleUserData(result.user, true);
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
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
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
