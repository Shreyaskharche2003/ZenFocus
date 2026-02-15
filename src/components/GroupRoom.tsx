'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Copy, Check, LogOut, Play, Crown,
    Send, Monitor, MonitorOff, MessageCircle, Clock
} from 'lucide-react';
import { GroupSession, ChatMessage } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { leaveRoom, listenToRoom, sendRoomMessage } from '@/lib/groupSessionService';
import { useRoomStore } from '@/store/roomStore';
import styles from './GroupRoom.module.css';

interface GroupRoomProps {
    onStartSession: () => void;
}

export default function GroupRoom({ onStartSession }: GroupRoomProps) {
    const { zenFocusUser } = useAuth();
    const { currentRoom, setRoom, clearRoom } = useRoomStore();
    const [copied, setCopied] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isLeaving, setIsLeaving] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Listen to room updates in real-time
    useEffect(() => {
        if (!currentRoom?.id) return;

        const unsubscribe = listenToRoom(currentRoom.id, (updatedRoom) => {
            setRoom(updatedRoom);
        });

        return () => unsubscribe();
    }, [currentRoom?.id]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentRoom?.messages?.length]);

    // Cleanup screen share on unmount
    useEffect(() => {
        return () => {
            if (screenStream) {
                screenStream.getTracks().forEach(t => t.stop());
            }
        };
    }, [screenStream]);

    if (!currentRoom || !zenFocusUser) return null;

    const participants = Object.values(currentRoom.participants);
    const isHost = zenFocusUser.id === currentRoom.hostId;
    const messages = currentRoom.messages || [];

    const handleCopyCode = () => {
        navigator.clipboard.writeText(currentRoom.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeave = async () => {
        setIsLeaving(true);
        try {
            if (screenStream) {
                screenStream.getTracks().forEach(t => t.stop());
                setScreenStream(null);
            }
            await leaveRoom(currentRoom.id, zenFocusUser.id);
            clearRoom();
        } catch (err) {
            console.error('Error leaving:', err);
        }
        setIsLeaving(false);
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        await sendRoomMessage(currentRoom.id, zenFocusUser.id, zenFocusUser.displayName, chatInput.trim());
        setChatInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing && screenStream) {
            screenStream.getTracks().forEach(t => t.stop());
            setScreenStream(null);
            setIsScreenSharing(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setScreenStream(stream);
                setIsScreenSharing(true);
                if (screenVideoRef.current) {
                    screenVideoRef.current.srcObject = stream;
                }
                stream.getTracks()[0].onended = () => {
                    setIsScreenSharing(false);
                    setScreenStream(null);
                };
            } catch (err) {
                console.log('Screen share cancelled');
            }
        }
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Top Bar */}
            <div className={styles.topBar}>
                <div className={styles.topLeft}>
                    <div className={styles.roomTitle}>
                        <Users size={20} />
                        <h2>Study Room</h2>
                    </div>
                    <div className={styles.inviteChip} onClick={handleCopyCode}>
                        <span>Code: <strong>{currentRoom.inviteCode}</strong></span>
                        {copied ? <Check size={14} className={styles.checkIcon} /> : <Copy size={14} />}
                    </div>
                </div>
                <div className={styles.topRight}>
                    <button className={styles.iconBtn} onClick={toggleScreenShare} title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
                        {isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
                    </button>
                    <button className={`${styles.iconBtn} ${styles.leaveBtn}`} onClick={handleLeave} disabled={isLeaving}>
                        <LogOut size={18} />
                        <span>Leave</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.main}>
                {/* Left: Screen Share / Welcome */}
                <div className={styles.centerArea}>
                    {isScreenSharing ? (
                        <div className={styles.screenShare}>
                            <video ref={screenVideoRef} autoPlay playsInline className={styles.screenVideo} />
                        </div>
                    ) : (
                        <div className={styles.welcomeArea}>
                            <div className={styles.welcomeIcon}>
                                <Users size={48} />
                            </div>
                            <h3>Welcome to the Study Room!</h3>
                            <p>Share your invite code with friends. Once everyone is here, start your focus session together.</p>

                            <div className={styles.codeDisplay} onClick={handleCopyCode}>
                                <span className={styles.codeDigits}>{currentRoom.inviteCode}</span>
                                <span className={styles.codeCopy}>{copied ? '✓ Copied' : 'Click to copy'}</span>
                            </div>

                            {participants.length === 1 && (
                                <div className={styles.waitingPulse}>
                                    <Clock size={16} />
                                    <span>Waiting for friends to join...</span>
                                </div>
                            )}

                            {isHost ? (
                                <button
                                    className={styles.startBtn}
                                    onClick={() => {
                                        console.log('🟢 Host starting group session...');
                                        setIsStarting(true);
                                        onStartSession();
                                    }}
                                    disabled={isStarting}
                                >
                                    <Play size={20} />
                                    <span>{isStarting ? 'Starting...' : 'Start Focus Session'}</span>
                                </button>
                            ) : (
                                <div className={styles.waitingPulse}>
                                    <Clock size={16} />
                                    <span>Waiting for host to start the session...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Members + Chat */}
                <div className={styles.sidebar}>
                    {/* Members */}
                    <div className={styles.membersSection}>
                        <div className={styles.sectionTitle}>
                            <Users size={16} />
                            <span>Members ({participants.length})</span>
                        </div>
                        <div className={styles.membersList}>
                            <AnimatePresence>
                                {participants.map((p) => (
                                    <motion.div
                                        key={p.id}
                                        className={styles.member}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                    >
                                        <div className={styles.memberAvatar}>
                                            {p.photoURL ? (
                                                <img src={p.photoURL} alt={p.displayName} />
                                            ) : (
                                                <div className={styles.avatarFallback}>
                                                    {getInitials(p.displayName)}
                                                </div>
                                            )}
                                            <div className={styles.onlineDot} />
                                        </div>
                                        <span className={styles.memberName}>
                                            {p.displayName}
                                            {p.id === zenFocusUser.id && ' (You)'}
                                        </span>
                                        {p.id === currentRoom.hostId && (
                                            <Crown size={14} className={styles.crownIcon} />
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Chat */}
                    <div className={styles.chatSection}>
                        <div className={styles.sectionTitle}>
                            <MessageCircle size={16} />
                            <span>Chat</span>
                        </div>
                        <div className={styles.chatMessages}>
                            {messages.length === 0 && (
                                <div className={styles.chatEmpty}>
                                    <p>No messages yet. Say hi! 👋</p>
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`${styles.chatMsg} ${msg.senderId === zenFocusUser.id ? styles.chatMsgOwn : ''}`}
                                >
                                    {msg.senderId !== zenFocusUser.id && (
                                        <span className={styles.msgSender}>{msg.senderName}</span>
                                    )}
                                    <p className={styles.msgText}>{msg.text}</p>
                                    <span className={styles.msgTime}>{formatTime(msg.timestamp)}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className={styles.chatInput}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                            />
                            <button onClick={handleSendMessage} disabled={!chatInput.trim()}>
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
