'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, LogIn, X, Copy, Check, Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { createGroupRoom, joinRoomByCode } from '@/lib/groupSessionService';
import { useRoomStore } from '@/store/roomStore';
import GlassCard from './GlassCard';
import Button from './Button';
import styles from './GroupLobby.module.css';

interface GroupLobbyProps {
    onClose: () => void;
}

export default function GroupLobby({ onClose }: GroupLobbyProps) {
    const { zenFocusUser } = useAuth();
    const { setRoom } = useRoomStore();

    const [view, setView] = useState<'selection' | 'create' | 'join'>('selection');
    const [inviteCode, setInviteCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateRoom = async () => {
        console.log('🔵 Create Room clicked');
        console.log('🔵 zenFocusUser:', zenFocusUser);

        if (!zenFocusUser) {
            console.log('❌ No user found');
            setError('Please sign in to create a room.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🔵 Calling createGroupRoom...');
            const room = await createGroupRoom(
                zenFocusUser.id,
                zenFocusUser.displayName,
                zenFocusUser.photoURL
            );
            console.log('🔵 Room created:', room);

            if (room) {
                setRoom(room);
                onClose();
            } else {
                console.log('❌ Room creation returned null');
                setError('Failed to create room. Please try again.');
            }
        } catch (err) {
            console.error('❌ Error creating room:', err);
            setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!zenFocusUser) {
            setError('Please sign in to join a room.');
            return;
        }
        if (!inviteCode) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log('🔵 Attempting to join room with code:', inviteCode);
            const roomId = await joinRoomByCode(
                inviteCode,
                zenFocusUser.id,
                zenFocusUser.displayName,
                zenFocusUser.photoURL
            );
            if (roomId) {
                console.log('🔵 Successfully joined room:', roomId);
                // Fetch the full room data
                const { getRoomById } = await import('@/lib/groupSessionService');
                const roomData = await getRoomById(roomId);

                if (roomData) {
                    console.log('🔵 Room data fetched:', roomData);
                    setRoom(roomData);
                    onClose();
                } else {
                    setError('Failed to load room data.');
                }
            } else {
                setError('Invalid code or room is closed.');
            }
        } catch (err) {
            console.error('❌ Error joining room:', err);
            setError('Could not join room.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <GlassCard className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <Users className={styles.titleIcon} size={32} />
                    <h2>Study with Friends</h2>
                    <p>Focus together and keep each other accountable.</p>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'selection' && (
                        <motion.div
                            key="selection"
                            className={styles.selectionView}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <button
                                className={styles.optionCard}
                                onClick={handleCreateRoom}
                                disabled={isLoading}
                            >
                                <div className={styles.optionIcon}>
                                    <UserPlus size={24} />
                                </div>
                                <div className={styles.optionText}>
                                    <h3>Create New Room</h3>
                                    <p>Get a code and invite your peers to join you.</p>
                                </div>
                            </button>

                            <button
                                className={styles.optionCard}
                                onClick={() => setView('join')}
                            >
                                <div className={styles.optionIcon}>
                                    <LogIn size={24} />
                                </div>
                                <div className={styles.optionText}>
                                    <h3>Join Existing Room</h3>
                                    <p>Enter an invite code from a friend.</p>
                                </div>
                            </button>

                            {error && <p className={styles.error}>{error}</p>}
                        </motion.div>
                    )}

                    {view === 'join' && (
                        <motion.div
                            key="join"
                            className={styles.formView}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h3>Enter Invite Code</h3>
                            <input
                                type="text"
                                placeholder="6-digit code"
                                maxLength={6}
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.replace(/\D/g, ''))}
                                className={styles.input}
                                autoFocus
                            />
                            {error && <p className={styles.error}>{error}</p>}
                            <div className={styles.actions}>
                                <Button variant="secondary" onClick={() => setView('selection')}>Back</Button>
                                <Button variant="primary" onClick={handleJoinRoom} loading={isLoading} disabled={inviteCode.length < 6}>Join Room</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={styles.footer}>
                    <Shield size={14} />
                    <span>Participants can only see your focus state (FOCUSED/DISTRACTED), never your camera feed.</span>
                </div>
            </GlassCard>
        </motion.div>
    );
}
