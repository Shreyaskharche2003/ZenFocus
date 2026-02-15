import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    onSnapshot,
    arrayUnion,
    serverTimestamp,
    deleteField
} from 'firebase/firestore';
import { db } from './firebase';
import { GroupSession, Participant, FocusState, ChatMessage } from './types';

const ROOMS_COLLECTION = 'rooms';

// Generate a random 6-digit invite code
const generateInviteCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createGroupRoom = async (userId: string, displayName: string, photoURL?: string): Promise<GroupSession | null> => {
    try {
        console.log('🟢 [groupSessionService] Starting createGroupRoom');
        console.log('🟢 [groupSessionService] userId:', userId);
        console.log('🟢 [groupSessionService] displayName:', displayName);

        const inviteCode = generateInviteCode();
        console.log('🟢 [groupSessionService] Generated invite code:', inviteCode);

        const roomId = doc(collection(db, ROOMS_COLLECTION)).id;
        console.log('🟢 [groupSessionService] Generated room ID:', roomId);

        const hostParticipant: Participant = {
            id: userId,
            displayName,
            currentState: 'IDLE',
            lastSeen: Date.now()
        };

        // Only add photoURL if it exists (Firestore doesn't accept undefined)
        if (photoURL) {
            hostParticipant.photoURL = photoURL;
        }

        console.log('🟢 [groupSessionService] Host participant:', hostParticipant);

        const roomData: GroupSession = {
            id: roomId,
            hostId: userId,
            inviteCode,
            participants: {
                [userId]: hostParticipant
            },
            status: 'active',
            createdAt: Date.now()
        };
        console.log('🟢 [groupSessionService] Room data prepared:', roomData);

        console.log('🟢 [groupSessionService] Attempting to write to Firestore...');
        await setDoc(doc(db, ROOMS_COLLECTION, roomId), roomData);
        console.log('✅ [groupSessionService] Room created successfully!');

        return roomData;
    } catch (error) {
        console.error('❌ [groupSessionService] Error creating group room:', error);
        console.error('❌ [groupSessionService] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            code: (error as any)?.code,
            stack: error instanceof Error ? error.stack : undefined
        });
        return null;
    }
};

export const joinRoomByCode = async (inviteCode: string, userId: string, displayName: string, photoURL?: string): Promise<string | null> => {
    try {
        const q = query(collection(db, ROOMS_COLLECTION), where("inviteCode", "==", inviteCode), where("status", "==", "active"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Room not found or expired');
        }

        const roomDoc = querySnapshot.docs[0];
        const roomId = roomDoc.id;

        const newParticipant: Participant = {
            id: userId,
            displayName,
            currentState: 'IDLE',
            lastSeen: Date.now()
        };

        // Only add photoURL if it exists (Firestore doesn't accept undefined)
        if (photoURL) {
            newParticipant.photoURL = photoURL;
        }

        await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
            [`participants.${userId}`]: newParticipant
        });

        return roomId;
    } catch (error) {
        console.error('Error joining room:', error);
        return null;
    }
};

export const updateParticipantStatus = async (roomId: string, userId: string, state: FocusState) => {
    try {
        await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
            [`participants.${userId}.currentState`]: state,
            [`participants.${userId}.lastSeen`]: Date.now()
        });
    } catch (error) {
        console.error('Error updating status:', error);
    }
};

export const leaveRoom = async (roomId: string, userId: string): Promise<void> => {
    try {
        const roomRef = doc(db, ROOMS_COLLECTION, roomId);
        await updateDoc(roomRef, {
            [`participants.${userId}`]: deleteField()
        });
    } catch (error) {
        console.error('Error leaving room:', error);
    }
};

export const listenToRoom = (roomId: string, callback: (room: GroupSession) => void) => {
    return onSnapshot(doc(db, ROOMS_COLLECTION, roomId), (doc) => {
        if (doc.exists()) {
            callback(doc.data() as GroupSession);
        }
    });
};

export const getRoomById = async (roomId: string): Promise<GroupSession | null> => {
    try {
        const roomDoc = await getDoc(doc(db, ROOMS_COLLECTION, roomId));
        if (roomDoc.exists()) {
            return roomDoc.data() as GroupSession;
        }
        return null;
    } catch (error) {
        console.error('Error fetching room:', error);
        return null;
    }
};

export const sendRoomMessage = async (roomId: string, senderId: string, senderName: string, text: string) => {
    try {
        const message: ChatMessage = {
            id: `${senderId}_${Date.now()}`,
            senderId,
            senderName,
            text,
            timestamp: Date.now()
        };
        await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
            messages: arrayUnion(message)
        });
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

export const deleteRoom = async (roomId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
        console.log('✅ Room deleted from database:', roomId);
    } catch (error) {
        console.error('Error deleting room:', error);
    }
};

export const startRoomSession = async (roomId: string): Promise<void> => {
    try {
        await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
            status: 'in_session'
        });
        console.log('✅ Room session started:', roomId);
    } catch (error) {
        console.error('Error starting room session:', error);
    }
};
