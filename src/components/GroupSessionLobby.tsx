'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Check, LogOut, Play, UserPlus, Video, VideoOff, Crown, Clock } from 'lucide-react';
import { GroupSession } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { leaveRoom } from '@/lib/groupSessionService';
import { useRoomStore } from '@/store/roomStore';
import GlassCard from './GlassCard';
import Button from './Button';
import styles from './GroupSessionLobby.module.css';

interface GroupSessionLobbyProps {
    room: GroupSession;
    onStartSession: () => void;
}

export default function GroupSessionLobby({ room, onStartSession }: GroupSessionLobbyProps) {
    const { zenFocusUser } = useAuth();
    const { clearRoom } = useRoomStore();
    const [copied, setCopied] = useState(false);
    const [screenShareEnabled, setScreenShareEnabled] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const participants = Object.values(room.participants);
    const isHost = zenFocusUser?.id === room.hostId;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(room.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeaveRoom = async () => {
        if (!zenFocusUser) return;
        setIsLeaving(true);

        try {
            await leaveRoom(room.id, zenFocusUser.id);
            clearRoom();
        } catch (error) {
            console.error('Error leaving room:', error);
        } finally {
            setIsLeaving(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <GlassCard className={styles.lobby}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerIcon}>
                        <Users size={32} />
                    </div>
                    <h2>Group Study Session</h2>
                    <p>Collaborate and stay focused together</p>
                </div>

                {/* Invite Code Section */}
                <div className={styles.inviteSection}>
                    <div className={styles.inviteLabel}>
                        <UserPlus size={16} />
                        <span>Invite Friends</span>
                    </div>
                    <div className={styles.inviteCodeBox} onClick={handleCopyCode}>
                        <span className={styles.codeLabel}>Room Code:</span>
                        <span className={styles.code}>{room.inviteCode}</span>
                        <button className={styles.copyBtn}>
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                    <p className={styles.inviteHint}>
                        {copied ? '✓ Copied to clipboard!' : 'Click to copy and share with friends'}
                    </p>
                </div>

                {/* Participants Grid */}
                <div className={styles.participantsSection}>
                    <div className={styles.sectionHeader}>
                        <Users size={18} />
                        <h3>Participants ({participants.length})</h3>
                    </div>

                    <div className={styles.participantsGrid}>
                        <AnimatePresence>
                            {participants.map((participant) => (
                                <motion.div
                                    key={participant.id}
                                    className={styles.participantCard}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    layout
                                >
                                    <div className={styles.participantAvatar}>
                                        {participant.photoURL ? (
                                            <img src={participant.photoURL} alt={participant.displayName} />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {getInitials(participant.displayName)}
                                            </div>
                                        )}
                                        {participant.id === room.hostId && (
                                            <div className={styles.hostBadge} title="Host">
                                                <Crown size={12} />
                                            </div>
                                        )}
                                        <div className={styles.statusDot} />
                                    </div>
                                    <div className={styles.participantInfo}>
                                        <span className={styles.participantName}>
                                            {participant.displayName}
                                            {participant.id === zenFocusUser?.id && ' (You)'}
                                        </span>
                                        <span className={styles.participantStatus}>Ready</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {participants.length === 1 && (
                        <div className={styles.waitingMessage}>
                            <Clock size={20} />
                            <p>Waiting for others to join...</p>
                        </div>
                    )}
                </div>

                {/* Screen Share Toggle */}
                <div className={styles.optionsSection}>
                    <div className={styles.option}>
                        <div className={styles.optionInfo}>
                            <Video size={20} />
                            <div>
                                <h4>Screen Sharing</h4>
                                <p>Share your screen during the session (optional)</p>
                            </div>
                        </div>
                        <button
                            className={`${styles.toggle} ${screenShareEnabled ? styles.toggleActive : ''}`}
                            onClick={() => setScreenShareEnabled(!screenShareEnabled)}
                        >
                            <div className={styles.toggleSlider} />
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    <Button
                        variant="secondary"
                        onClick={handleLeaveRoom}
                        loading={isLeaving}
                    >
                        <LogOut size={18} />
                        Leave Room
                    </Button>

                    {isHost ? (
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={onStartSession}
                            disabled={participants.length < 1}
                        >
                            <Play size={18} />
                            Start Group Session
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={onStartSession}
                        >
                            <Play size={18} />
                            Ready to Start
                        </Button>
                    )}
                </div>

                {/* Info Footer */}
                <div className={styles.footer}>
                    <p>💡 Your focus state will be visible to all participants. Camera feed stays private.</p>
                </div>
            </GlassCard>
        </motion.div>
    );
}
