'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, Copy, Check, Users } from 'lucide-react';
import { GroupSession, Participant } from '@/lib/types';
import { useState } from 'react';
import styles from './RoomParticipants.module.css';

interface RoomParticipantsProps {
    room: GroupSession;
}

export default function RoomParticipants({ room }: RoomParticipantsProps) {
    const [copied, setCopied] = useState(false);
    const participants = Object.values(room.participants);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(room.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusColor = (state: string) => {
        switch (state) {
            case 'FOCUSED': return '#22c55e';
            case 'DISTRACTED': return '#f97316';
            case 'AWAY': return '#6b7280';
            case 'SLEEPING': return '#8b5cf6';
            default: return '#94a3b8';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.info}>
                    <div className={styles.roomBadge}>
                        <Users size={14} />
                        <span>{participants.length} Active</span>
                    </div>
                    <div className={styles.inviteCode} onClick={handleCopyCode}>
                        <span>Code: {room.inviteCode}</span>
                        {copied ? <Check size={14} className={styles.check} /> : <Copy size={14} />}
                    </div>
                </div>
            </div>

            <div className={styles.list}>
                <AnimatePresence>
                    {participants.map((p) => (
                        <motion.div
                            key={p.id}
                            className={styles.participant}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                        >
                            <div className={styles.avatarWrapper}>
                                {p.photoURL ? (
                                    <img src={p.photoURL} alt={p.displayName} className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        <User size={16} />
                                    </div>
                                )}
                                <div
                                    className={styles.statusDot}
                                    style={{ backgroundColor: getStatusColor(p.currentState) }}
                                />
                            </div>
                            <div className={styles.details}>
                                <span className={styles.name}>{p.displayName}</span>
                                <span className={styles.state} style={{ color: getStatusColor(p.currentState) }}>
                                    {p.currentState}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
