'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Copy, Check, LogOut, Send, Monitor, MonitorOff,
    MessageCircle, Crown, Target, Plus, X, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { sendRoomMessage, leaveRoom } from '@/lib/groupSessionService';
import { useRoomStore } from '@/store/roomStore';
import styles from './GroupSessionPanel.module.css';

interface GroupSessionPanelProps {
    onLeaveRoom: () => void;
}

export default function GroupSessionPanel({ onLeaveRoom }: GroupSessionPanelProps) {
    const { zenFocusUser } = useAuth();
    const { currentRoom } = useRoomStore();
    const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'goals'>('members');
    const [chatInput, setChatInput] = useState('');
    const [copied, setCopied] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [goals, setGoals] = useState<{ text: string; done: boolean }[]>([]);
    const [goalInput, setGoalInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentRoom?.messages?.length, activeTab]);

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
    const messages = currentRoom.messages || [];

    const handleCopyCode = () => {
        navigator.clipboard.writeText(currentRoom.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        await sendRoomMessage(currentRoom.id, zenFocusUser.id, zenFocusUser.displayName, chatInput.trim());
        setChatInput('');
    };

    const handleChatKeyPress = (e: React.KeyboardEvent) => {
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

    const addGoal = () => {
        if (!goalInput.trim()) return;
        setGoals(prev => [...prev, { text: goalInput.trim(), done: false }]);
        setGoalInput('');
    };

    const toggleGoal = (index: number) => {
        setGoals(prev => prev.map((g, i) => i === index ? { ...g, done: !g.done } : g));
    };

    const removeGoal = (index: number) => {
        setGoals(prev => prev.filter((_, i) => i !== index));
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const formatTime = (ts: number) =>
        new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const completedGoals = goals.filter(g => g.done).length;

    return (
        <div className={styles.panel}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <Users size={16} />
                    <span>Group Session</span>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.codeChip} onClick={handleCopyCode} title="Copy invite code">
                        <span>{currentRoom.inviteCode}</span>
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                </div>
            </div>

            {/* Screen Share Preview */}
            {isScreenSharing && (
                <div className={styles.screenPreview}>
                    <video ref={screenVideoRef} autoPlay playsInline className={styles.screenVideo} />
                </div>
            )}

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <button
                    className={`${styles.actionBtn} ${isScreenSharing ? styles.actionActive : ''}`}
                    onClick={toggleScreenShare}
                    title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                    {isScreenSharing ? <MonitorOff size={15} /> : <Monitor size={15} />}
                </button>
                <button className={`${styles.actionBtn} ${styles.leaveAction}`} onClick={onLeaveRoom} title="Leave room">
                    <LogOut size={15} />
                </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'members' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    <Users size={14} />
                    <span>{participants.length}</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'chat' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    <MessageCircle size={14} />
                    {messages.length > 0 && <span className={styles.badge}>{messages.length}</span>}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'goals' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('goals')}
                >
                    <Target size={14} />
                    {goals.length > 0 && <span className={styles.badge}>{completedGoals}/{goals.length}</span>}
                </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className={styles.membersList}>
                        {participants.map(p => (
                            <div key={p.id} className={styles.member}>
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
                                <div className={styles.memberInfo}>
                                    <span className={styles.memberName}>
                                        {p.displayName}
                                        {p.id === zenFocusUser.id && ' (You)'}
                                    </span>
                                    <span className={styles.memberStatus}>
                                        {p.currentState === 'FOCUSED' ? '🟢 Focused' :
                                            p.currentState === 'DISTRACTED' ? '🟡 Distracted' :
                                                p.currentState === 'AWAY' ? '🔴 Away' : '⚪ Idle'}
                                    </span>
                                </div>
                                {p.id === currentRoom.hostId && (
                                    <Crown size={13} className={styles.crownIcon} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className={styles.chatContainer}>
                        <div className={styles.chatMessages}>
                            {messages.length === 0 && (
                                <div className={styles.emptyState}>Say hi! 👋</div>
                            )}
                            {messages.map(msg => (
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
                                placeholder="Message..."
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={handleChatKeyPress}
                            />
                            <button onClick={handleSendMessage} disabled={!chatInput.trim()}>
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Goals Tab */}
                {activeTab === 'goals' && (
                    <div className={styles.goalsContainer}>
                        <div className={styles.goalsList}>
                            {goals.length === 0 && (
                                <div className={styles.emptyState}>
                                    <Target size={24} />
                                    <p>Set your session goals</p>
                                </div>
                            )}
                            <AnimatePresence>
                                {goals.map((goal, i) => (
                                    <motion.div
                                        key={`${goal.text}-${i}`}
                                        className={`${styles.goalItem} ${goal.done ? styles.goalDone : ''}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <button className={styles.goalCheck} onClick={() => toggleGoal(i)}>
                                            {goal.done ? <CheckCircle size={16} /> : <div className={styles.goalCircle} />}
                                        </button>
                                        <span className={styles.goalText}>{goal.text}</span>
                                        <button className={styles.goalRemove} onClick={() => removeGoal(i)}>
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <div className={styles.goalInput}>
                            <input
                                type="text"
                                placeholder="Add a goal..."
                                value={goalInput}
                                onChange={e => setGoalInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') addGoal(); }}
                            />
                            <button onClick={addGoal} disabled={!goalInput.trim()}>
                                <Plus size={16} />
                            </button>
                        </div>
                        {goals.length > 0 && (
                            <div className={styles.goalProgress}>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${goals.length > 0 ? (completedGoals / goals.length) * 100 : 0}%` }}
                                    />
                                </div>
                                <span>{completedGoals}/{goals.length} completed</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
