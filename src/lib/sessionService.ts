import {
    collection,
    doc,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    updateDoc,
    Timestamp,
    DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Session } from './types';

// ========================================
// FIRESTORE SESSION SERVICE
// Manages focus sessions in the cloud
// ========================================

const SESSIONS_COLLECTION = 'sessions';

export interface SessionDocument extends Omit<Session, 'startTime' | 'endTime'> {
    startTime: Timestamp;
    endTime?: Timestamp;
}

// Convert Session to Firestore document
const sessionToDoc = (session: Session): DocumentData => {
    const doc: DocumentData = {
        ...session,
        startTime: Timestamp.fromMillis(session.startTime),
    };

    if (session.endTime) {
        doc.endTime = Timestamp.fromMillis(session.endTime);
    }

    return doc;
};

// Convert Firestore document to Session
const docToSession = (doc: DocumentData, id: string): Session => {
    return {
        ...doc,
        id,
        startTime: doc.startTime?.toMillis() || Date.now(),
        endTime: doc.endTime?.toMillis(),
    } as Session;
};

// Save a completed session
export const saveSession = async (session: Session): Promise<string | null> => {
    try {
        const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), sessionToDoc(session));
        console.log('✅ Session saved to Firestore:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Failed to save session:', error);
        return null;
    }
};

// Get sessions for a user (last N days)
export const getUserSessions = async (
    userId: string,
    daysBack: number = 30,
    maxSessions: number = 100
): Promise<Session[]> => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        startDate.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, SESSIONS_COLLECTION),
            where('userId', '==', userId),
            where('startTime', '>=', Timestamp.fromDate(startDate)),
            orderBy('startTime', 'desc'),
            limit(maxSessions)
        );

        const snapshot = await getDocs(q);
        const sessions: Session[] = [];

        snapshot.forEach((doc) => {
            sessions.push(docToSession(doc.data(), doc.id));
        });

        console.log(`📊 Fetched ${sessions.length} sessions for user`);
        return sessions;
    } catch (error) {
        console.error('❌ Failed to fetch sessions:', error);
        return [];
    }
};

// Get today's sessions
export const getTodaySessions = async (userId: string): Promise<Session[]> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, SESSIONS_COLLECTION),
            where('userId', '==', userId),
            where('startTime', '>=', Timestamp.fromDate(today)),
            orderBy('startTime', 'desc')
        );

        const snapshot = await getDocs(q);
        const sessions: Session[] = [];

        snapshot.forEach((doc) => {
            sessions.push(docToSession(doc.data(), doc.id));
        });

        return sessions;
    } catch (error) {
        console.error('❌ Failed to fetch today\'s sessions:', error);
        return [];
    }
};

// Get weekly summary
export const getWeeklyStats = async (userId: string): Promise<{
    days: { date: string; dayName: string; focusMinutes: number; sessions: number }[];
    totalFocusMinutes: number;
    totalSessions: number;
    averageScore: number;
}> => {
    const sessions = await getUserSessions(userId, 7);

    const days: { date: string; dayName: string; focusMinutes: number; sessions: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        days.push({
            date: date.toISOString().split('T')[0],
            dayName: dayNames[date.getDay()],
            focusMinutes: 0,
            sessions: 0,
        });
    }

    // Aggregate sessions by day
    let totalScore = 0;
    let scoredSessions = 0;

    sessions.forEach((session) => {
        const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
        const dayEntry = days.find(d => d.date === sessionDate);

        if (dayEntry) {
            dayEntry.focusMinutes += session.totalFocusMinutes || 0;
            dayEntry.sessions++;
        }

        if (session.productivityScore !== undefined) {
            totalScore += session.productivityScore;
            scoredSessions++;
        }
    });

    return {
        days,
        totalFocusMinutes: sessions.reduce((sum, s) => sum + (s.totalFocusMinutes || 0), 0),
        totalSessions: sessions.length,
        averageScore: scoredSessions > 0 ? Math.round(totalScore / scoredSessions) : 0,
    };
};

// Calculate user stats from sessions
export const calculateUserStats = async (userId: string): Promise<{
    totalFocusMinutes: number;
    totalSessions: number;
    currentStreak: number;
    longestStreak: number;
    averageProductivityScore: number;
    todayFocusMinutes: number;
}> => {
    const sessions = await getUserSessions(userId, 365); // Get up to a year
    const todaySessions = await getTodaySessions(userId);

    // Calculate totals
    const totalFocusMinutes = sessions.reduce((sum, s) => sum + (s.totalFocusMinutes || 0), 0);
    const totalSessions = sessions.length;

    // Calculate average score
    const scoredSessions = sessions.filter(s => s.productivityScore !== undefined);
    const averageProductivityScore = scoredSessions.length > 0
        ? Math.round(scoredSessions.reduce((sum, s) => sum + (s.productivityScore || 0), 0) / scoredSessions.length)
        : 0;

    // Calculate today's focus
    const todayFocusMinutes = todaySessions.reduce((sum, s) => sum + (s.totalFocusMinutes || 0), 0);

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(sessions);

    return {
        totalFocusMinutes,
        totalSessions,
        currentStreak,
        longestStreak,
        averageProductivityScore,
        todayFocusMinutes,
    };
};

// Calculate streaks from sessions
const calculateStreaks = (sessions: Session[]): { currentStreak: number; longestStreak: number } => {
    if (sessions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique dates with sessions
    const sessionDates = new Set<string>();
    sessions.forEach(s => {
        const date = new Date(s.startTime).toISOString().split('T')[0];
        sessionDates.add(date);
    });

    const sortedDates = Array.from(sessionDates).sort().reverse();

    // Check if today or yesterday has a session (for current streak)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak
    if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
        const startDate = sortedDates.includes(today) ? today : yesterday;
        let checkDate = new Date(startDate);

        while (sessionDates.has(checkDate.toISOString().split('T')[0])) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
    }

    // Calculate longest streak
    sortedDates.forEach((date, index) => {
        if (index === 0) {
            tempStreak = 1;
        } else {
            const prevDate = new Date(sortedDates[index - 1]);
            const currDate = new Date(date);
            const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);

            if (diffDays === 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
        }

        longestStreak = Math.max(longestStreak, tempStreak);
    });

    return { currentStreak, longestStreak };
};

// Update user stats in Firestore (called after session ends)
export const updateUserStatsInFirestore = async (
    userId: string,
    session: Session
): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', userId);

        // We'll update stats incrementally
        // In a production app, you might use a Cloud Function for this
        const stats = await calculateUserStats(userId);

        await updateDoc(userDocRef, {
            'stats.totalFocusMinutes': stats.totalFocusMinutes,
            'stats.totalSessions': stats.totalSessions,
            'stats.currentStreak': stats.currentStreak,
            'stats.longestStreak': stats.longestStreak,
            'stats.averageProductivityScore': stats.averageProductivityScore,
        });

        console.log('✅ User stats updated in Firestore');
    } catch (error) {
        console.error('❌ Failed to update user stats:', error);
    }
};

// Get recent sessions (for display)
export const getRecentSessions = async (userId: string, count: number = 5): Promise<{
    date: string;
    displayDate: string;
    focusMinutes: number;
    distractedMinutes: number;
    score: number;
}[]> => {
    const sessions = await getUserSessions(userId, 14, count);

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    return sessions.map(session => {
        const date = new Date(session.startTime).toISOString().split('T')[0];
        let displayDate = new Date(session.startTime).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        if (date === today) displayDate = 'Today';
        else if (date === yesterday) displayDate = 'Yesterday';

        return {
            date,
            displayDate,
            focusMinutes: session.totalFocusMinutes || 0,
            distractedMinutes: session.totalDistractedMinutes || 0,
            score: session.productivityScore || 0,
        };
    });
};
