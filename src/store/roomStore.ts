import { create } from 'zustand';
import { GroupSession, Participant } from '@/lib/types';

interface RoomState {
    currentRoom: GroupSession | null;
    isInRoom: boolean;
    setRoom: (room: GroupSession | null) => void;
    clearRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
    currentRoom: null,
    isInRoom: false,
    setRoom: (room) => set({ currentRoom: room, isInRoom: !!room }),
    clearRoom: () => set({ currentRoom: null, isInRoom: false }),
}));
