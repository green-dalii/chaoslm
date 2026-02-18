"use client";

import React, { useEffect, useRef, useState, Children } from "react";
import { useRoomStore } from "@/hooks/use-room-store";
import { useConductor } from "@/hooks/use-conductor";
import { useSettingsStore, translations } from "@/hooks/use-settings-store";
import { getUpcomingSpeakers } from "@/lib/conductor/scheduler";
import { Play, Pause, Mic, User, Bot, MessageSquare, List, Trash2, BrainCircuit, RotateCcw, AlertTriangle, AlertCircle, Download as LucideDownload, Upload as LucideUpload } from "lucide-react";
import { IRoomState, IMessage, IAgent } from "@/types";
import { type IAgent as IAgentType } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper to parse @mentions from text
const parseMentions = (text: string): string[] => {
    const mentionRegex = /@(\S+)/g;
    const matches: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
        matches.push(match[1]);
    }
    return matches;
};

// Helper to render content with @mention highlighting, URL linking and Thinking support
const renderMessageContent = (text: string, t: Record<string, string>, allParticipants?: { name: string; color?: string }[]) => {
    // Check for <think> tags
    let thinkingContent = "";
    let mainContent = text;

    // Handle closed tags
    const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
        thinkingContent = thinkMatch[1].trim();
        mainContent = text.replace(thinkMatch[0], "").trim();
    } else if (text.includes("<think>")) {
        // Handle unclosed tag (still streaming thinking)
        const parts = text.split("<think>");
        thinkingContent = parts[1].trim();
        mainContent = parts[0].trim();
    }

    // Custom component for ReactMarkdown to handle @mentions
    const MentionComponent = ({ children }: { children: string }) => {
        const text = children;
        const parts = text.split(/(@\S+)/g);

        return (
            <>
                {parts.map((part, index) => {
                    if (part.startsWith('@')) {
                        const mentionName = part.substring(1);
                        const matchedParticipant = allParticipants?.find(
                            p => p.name.toLowerCase() === mentionName.toLowerCase()
                        );
                        return (
                            <span
                                key={index}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold ${matchedParticipant
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                                    }`}
                                style={matchedParticipant?.color ? { borderColor: matchedParticipant.color } : undefined}
                            >
                                <span className="text-xs">@</span>
                                <span>{mentionName}</span>
                            </span>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </>
        );
    };

    // ReactMarkdown components config
    const markdownComponents = {
        p: (({ children }: { children: React.ReactNode }) => {
            // Process text nodes to highlight @mentions
            const processed = Children.map(children, (child) => {
                if (typeof child === 'string') {
                    return <MentionComponent>{child}</MentionComponent>;
                }
                return child;
            });
            return <p className="mb-2 last:mb-0">{processed}</p>;
        }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        span: MentionComponent as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    };

    return (
        <div className="space-y-2">
            {thinkingContent && (
                <details className="group border border-zinc-200 dark:border-zinc-700/50 rounded-lg overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/30 transition-all duration-300">
                    <summary className="flex items-center gap-2 p-2 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer list-none select-none transition-colors border-b border-transparent group-open:border-zinc-200 dark:group-open:border-zinc-700/50">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                                <BrainCircuit className="w-3 h-3 text-blue-500" />
                            </div>
                            <span>{t.thinking}</span>
                            <div className="h-1 flex-1 border-b border-dotted border-zinc-200 dark:border-zinc-700 mx-2" />
                        </div>
                        <div className="transition-transform duration-300 group-open:rotate-180">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </summary>
                    <div className="p-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                        <div className="whitespace-pre-wrap font-mono opacity-80">
                            {thinkingContent}
                        </div>
                    </div>
                </details>
            )}
            <div className="message-text">
                {mainContent ? (
                    <div className="markdown-content prose dark:prose-invert max-w-none text-sm md:text-base">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {mainContent}
                        </ReactMarkdown>
                    </div>
                ) : (
                    thinkingContent ? <span className="text-zinc-400 italic text-sm animate-pulse flex items-center gap-2"><Bot className="w-4 h-4" /> {t.generating}</span> : ""
                )}
            </div>
        </div>
    );
};

export function ChatArena() {
    const {
        sessions, activeSessionId, setActiveSession, createNewSession, deleteSession,
        agents, history, status, setStatus, currentTurn, userRole, topic, name, resetRoom, importRoom,
        debateMode, currentRound, maxRounds, currentStage, id, isEnding, addMessage, setTurn
    } = useRoomStore();
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { language } = useSettingsStore();
    const t = translations[language].arena as Record<string, string>;
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Determine if user can send message
    const canSend = status === 'active' && currentTurn === 'user';

    // Get input placeholder based on current state
    const getInputPlaceholder = () => {
        if (status !== 'active') {
            return language === 'zh' ? "讨论已暂停" : "Discussion paused";
        }
        if (currentTurn !== 'user') {
            const currentAgent = agents.find(a => a.id === currentTurn);
            return t.waitingFor.replace('{name}', currentAgent?.name || (language === 'zh' ? '他人' : 'others'));
        }
        return t.typeMessage;
    };

    // Get send button tooltip
    const getSendButtonTooltip = () => {
        if (currentTurn !== 'user') {
            return language === 'zh' ? "等待您的回合..." : "Waiting for your turn...";
        }
        if (!inputValue.trim()) {
            return language === 'zh' ? "请输入消息" : "Please enter a message";
        }
        return language === 'zh' ? "发送消息" : "Send message";
    };

    // Get status text
    const getStatusText = () => {
        if (userRole === 'observer') {
            if (currentTurn === 'user') {
                return language === 'zh' ? "您当前是观察者，但可以随时加入讨论" : "You are an observer, but can join anytime";
            }
            return language === 'zh' ? "您正在以观察者身份观看讨论" : "You are watching as an observer";
        }
        return status === 'active' ? t.liveMode : t.paused;
    };

    // Handle send message
    const handleSendMessage = () => {
        if (!canSend || !inputValue.trim()) return;

        // Add message to history
        addMessage({
            id: crypto.randomUUID(),
            role: 'user',
            senderId: 'user',
            content: inputValue.trim(),
        });

        // Clear input
        setInputValue("");

        // If user was observer, they become participant when sending first message
        // This is handled by the conductor scheduling

        // Advance turn after user sends message
        setTimeout(() => {
            setTurn(agents.find(a => a.id === currentTurn)?.id || agents[0]?.id || '');
        }, 100);
    };

    // Activate the Conductor
    const { stop, isGenerating, regenerate, endDebate, lastError, restartTurn } = useConductor();

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const toggleStatus = () => {
        setStatus(status === "active" ? "paused" : "active");
    };

    // Combine agents and user for the participant list
    const participants = [
        ...agents,
        ...(userRole !== 'observer' ? [{
            id: 'user',
            name: language === 'zh' ? '您' : 'You',
            role: userRole,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
            color: '#2563eb',
            modelId: 'Human',
            providerId: 'manual'
        }] : [])
    ];

    return (
        <div className="flex flex-1 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans h-full">

            {/* LEFT COLUMN: Sessions (Sidebar) */}
            <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col hidden md:flex h-full shrink-0">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <List className="w-5 h-5 text-zinc-500" />
                        <h2 className="font-semibold text-sm">{t.sessions}</h2>
                    </div>
                    {/* ... (rest of search/import buttons) ... */}
                    <button
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.json';
                            input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (!file) return;
                                try {
                                    const text = await file.text();
                                    const data = JSON.parse(text);
                                    if (data.id && data.history) {
                                        importRoom(data);
                                        alert(t.importSuccess);
                                    } else {
                                        throw new Error(t.invalidFormat);
                                    }
                                } catch (err: unknown) {
                                    alert(t.importFailed + (err instanceof Error ? err.message : String(err)));
                                }
                            };
                            input.click();
                        }}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 transition-colors"
                        title="Import Session (JSON)"
                    >
                        <LucideUpload className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                    <button
                        onClick={createNewSession}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-xs font-bold mb-4"
                    >
                        + {language === 'zh' ? '开启新讨论' : 'New Discussion'}
                    </button>

                    {sessions.map((s: IRoomState, index: number) => (
                        <div
                            key={`${s.id}-${index}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveSession(s.id);
                            }}
                            className={`group p-3 rounded-xl text-sm cursor-pointer border transition-all relative ${s.id === activeSessionId
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-sm'
                                : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-200 dark:hover:border-zinc-800'}`}
                        >
                            <div className="font-bold truncate pr-8">{s.topic || (language === 'zh' ? '未命名讨论' : 'Untitled')}</div>
                            <div className="text-[10px] opacity-60 mt-1 flex items-center gap-2">
                                <span>{s.history.length} {language === 'zh' ? '消息' : 'msgs'}</span>
                                <span>•</span>
                                <span>{s.agents.length} {language === 'zh' ? '成员' : 'agents'}</span>
                            </div>

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `${s.topic || 'discussion'}_session_${new Date().getTime()}.json`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                    title="Export Session"
                                >
                                    <LucideDownload className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDeleteId(s.id);
                                    }}
                                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    title="Delete Session"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Inline confirmation for stability */}
                            <AnimatePresence>
                                {confirmDeleteId === s.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="absolute inset-0 z-20 bg-white/95 dark:bg-zinc-900/95 flex flex-col items-center justify-center p-2 rounded-xl border border-red-200 dark:border-red-900/50 backdrop-blur-sm"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <p className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-2">{language === 'zh' ? '确定删除？' : 'Delete session?'}</p>
                                        <div className="flex gap-2 w-full px-2">
                                            <button
                                                onClick={() => setConfirmDeleteId(null)}
                                                className="flex-1 py-1 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200"
                                            >
                                                {language === 'zh' ? '取消' : 'No'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    deleteSession(s.id);
                                                    setConfirmDeleteId(null);
                                                }}
                                                className="flex-1 py-1 text-[10px] font-bold bg-red-600 text-white rounded-md hover:bg-red-700"
                                            >
                                                {language === 'zh' ? '确定' : 'Yes'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </aside >

            {/* CENTER COLUMN: Chat Arena */}
            < main className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-black/50 relative h-full overflow-hidden" >
                {/* Error Banner */}
                {
                    history.length > 0 && history[history.length - 1].content.startsWith("Error:") && status === 'paused' && (
                        <div className="absolute top-16 left-0 right-0 z-20 bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-top-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{history[history.length - 1].content}</span>
                            <button
                                onClick={() => setStatus('active')}
                                className="ml-4 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs uppercase tracking-wider"
                            >
                                {t.retry}
                            </button>
                        </div>
                    )
                }

                {/* Header */}
                <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div className="flex-1 min-w-0 mr-4">
                        <h1 className="font-bold text-lg truncate max-w-[800px]">{topic || (language === 'zh' ? '讨论竞技场' : 'Discussion Arena')}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                {language === 'zh' ? (debateMode === 'standard' ? '自由/混乱' : (debateMode === 'classic' ? '经典' : '自定义')) : (debateMode === 'standard' ? 'Chaos' : debateMode)} {language === 'zh' ? '模式' : 'mode'}
                                {debateMode === 'custom' && ` (${currentRound}/${maxRounds})`}
                                {debateMode === 'classic' && ` (${currentStage.replace('_', ' ')})`}
                            </span>
                            <span className="text-[10px] text-zinc-400 capitalize">• {(language === 'zh' && status === 'active') ? '活跃' : ((language === 'zh' && status === 'paused') ? '已暂停' : status)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Stop Button (visible when generating) */}
                        {isGenerating && (
                            <button
                                onClick={stop}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 transition-all shadow-sm hover:bg-red-100 dark:hover:bg-red-900/40"
                                title="Stop Generation"
                            >
                                <div className="w-2 h-2 bg-red-500 rounded-sm animate-pulse" />
                                <span>{t.stop}</span>
                            </button>
                        )}

                        {/* End Discussion: Always visible if history started */}
                        {history.length > 0 && status !== 'completed' && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowEndConfirm(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:opacity-90 transition-all shadow-md group border border-transparent"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                                    <span>{t.endDebate}</span>
                                </button>

                                <AnimatePresence>
                                    {showEndConfirm && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-3 z-50 flex flex-col gap-2"
                                        >
                                            <p className="text-[10px] font-bold text-center text-zinc-600 dark:text-zinc-400">
                                                {language === 'zh' ? '确定结束当前讨论？' : 'End current discussion?'}
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowEndConfirm(false)}
                                                    className="flex-1 py-1 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 rounded-lg"
                                                >
                                                    {language === 'zh' ? '取消' : 'No'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        endDebate();
                                                        setShowEndConfirm(false);
                                                    }}
                                                    className="flex-1 py-1 text-[10px] font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg"
                                                >
                                                    {language === 'zh' ? '确定' : 'Yes'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {userRole === 'host' && (
                            <button
                                onClick={toggleStatus}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${status === 'active' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                                {status === 'active' ? <><Pause className="w-3.5 h-3.5" /> {t.pause}</> : <><Play className="w-3.5 h-3.5" /> {t.resume}</>}
                            </button>
                        )}
                    </div>
                </header>

                {/* Error Banner */}
                {
                    lastError && (
                        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/30 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{lastError}</span>
                            </div>
                            <button
                                onClick={restartTurn}
                                className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                {t.retry}
                            </button>
                        </div>
                    )
                }

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                    {history.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-center relative z-10">
                            {isGenerating ? (
                                <div className="flex flex-col items-center animate-in fade-in duration-500">
                                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6 shadow-lg shadow-blue-500/20"></div>
                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2 animate-pulse">{language === 'zh' ? '正在构建混沌场域...' : 'Constructing Chaos Field...'}</h3>
                                    <p className="text-sm text-zinc-500 max-w-md px-4 leading-relaxed">
                                        {language === 'zh'
                                            ? 'ChaosLM 正在分析话题、生成背景并召集参与者。请稍候，混乱即将开始...'
                                            : 'ChaosLM is analyzing the topic, weaving the context, and summoning participants. Please wait, chaos is imminent...'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                    <p>{t.waiting}</p>
                                    {userRole === 'host' && status !== 'active' && (
                                        <p className="text-sm mt-2">{t.clickStart}</p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {history.map((msg) => {
                            let sender = participants.find(p => p.id === msg.senderId) || agents.find(a => a.id === msg.senderId);

                            // Handle System
                            if (msg.senderId === 'system') {
                                sender = {
                                    id: 'system',
                                    name: 'ChaosLM',
                                    avatar: '',
                                    role: 'system',
                                    color: '#999',
                                    modelId: 'System',
                                    providerId: 'system',
                                    systemPrompt: '',
                                    temperature: 0.5
                                } as unknown as IAgent;
                            }

                            const isMe = msg.senderId === 'user';

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 max-w-3xl ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-1">
                                        {sender && sender.avatar ? (
                                            <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 dark:border-zinc-700 object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center shrink-0">
                                                {msg.senderId === 'system' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`flex flex-col gap-1 min-w-0 max-w-full`}>
                                        <div className={`flex items-baseline gap-2 text-xs ${isMe ? "justify-end" : ""}`}>
                                            <div className="flex items-center justify-between mb-1 px-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${isMe ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"}`}>{sender?.name || (language === 'zh' ? '未知' : 'Unknown')}</span>
                                                    {sender?.role === 'host' && (
                                                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded uppercase tracking-wider">
                                                            {language === 'zh' ? '主持人' : 'Moderator'}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Regenerate Button for AI messages (not system, not user) */}
                                                {msg.senderId !== 'user' && msg.senderId !== 'system' && (
                                                    <button
                                                        onClick={() => regenerate(msg.senderId)}
                                                        className="p-1 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                        title="Regenerate"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-zinc-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        <div
                                            className={`px-4 py-3 text-sm md:text-base leading-relaxed shadow-sm whitespace-pre-wrap ${isMe
                                                ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                                                : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-tl-none text-zinc-800 dark:text-zinc-200"
                                                }`}
                                        >
                                            {msg.content ? renderMessageContent(msg.content, t, participants.map(p => ({ name: p.name, color: p.color }))) : <span className="italic opacity-70 animate-pulse">{language === 'zh' ? '正在思考...' : 'Thinking...'}</span>}

                                            {/* Metrics Row */}
                                            {!isMe && msg.senderId !== 'system' && (msg.tokens || msg.duration) && (
                                                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-700/50 flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                                                    <div className="flex items-center gap-1">
                                                        <span className="opacity-50">Tokens:</span>
                                                        <span className="text-zinc-500 dark:text-zinc-300">{msg.tokens || '?'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="opacity-50">{language === 'zh' ? '延迟' : 'Latency'}:</span>
                                                        <span className="text-zinc-500 dark:text-zinc-300">{((msg.duration || 0) / 1000).toFixed(1)}s</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="opacity-50">{language === 'zh' ? '模型' : 'Model'}:</span>
                                                        <span className="text-zinc-500 dark:text-zinc-300 truncate max-w-[80px]">{sender?.modelId || 'unknown'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input for all users - available anytime but send button disabled during AI turns */}
                <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                    <div className="max-w-3xl mx-auto flex gap-2">
                        <input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={status === 'active' && currentTurn !== 'user'}
                            placeholder={getInputPlaceholder()}
                            className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!canSend || !inputValue.trim()}
                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center"
                            title={getSendButtonTooltip()}
                        >
                            <ArrowRightIcon />
                        </button>
                    </div>
                    <div className="text-center mt-2 text-xs text-zinc-400">
                        {getStatusText()}
                    </div>
                </div>
            </main >

            {/* RIGHT COLUMN: Participants & State */}
            < aside className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 hidden lg:flex h-full" >
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                    <h2 className="font-semibold text-sm">{t.participants}</h2>
                    <p className="text-xs text-zinc-500">{participants.length} {t.active}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                    {participants.map((p) => {
                        const isCurrentTurn = currentTurn === p.id;
                        return (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    borderColor: isCurrentTurn ? 'rgba(34, 197, 94, 0.5)' : 'transparent',
                                    backgroundColor: isCurrentTurn ? 'rgba(34, 197, 94, 0.05)' : 'transparent'
                                }}
                                className={`relative flex items-center gap-3 p-3 rounded-xl transition-all border ${isCurrentTurn
                                    ? 'shadow-sm ring-1 ring-green-500/20'
                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                <div className="relative">
                                    <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isCurrentTurn ? 'border-green-500' : 'border-zinc-200 dark:border-zinc-700'}`}>
                                        <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} alt={p.name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Active "Speaking" Ring */}
                                    {isCurrentTurn && (
                                        <div className="absolute -inset-1 rounded-full border border-green-500 animate-ping opacity-75"></div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={`text-sm font-semibold truncate ${isCurrentTurn ? 'text-green-700 dark:text-green-400' : ''}`}>
                                            {p.name}
                                        </span>
                                        <div className="text-[10px] text-zinc-400 truncate opacity-70 group-hover:opacity-100 transition-opacity ml-2">
                                            {p.modelId}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                            {language === 'zh' ? (p.role === 'host' ? '主持人' : '成员') : (p.role === 'participant' ? 'Member' : p.role)}
                                        </span>

                                        {isCurrentTurn && (
                                            <span className="text-[10px] text-green-600 font-medium animate-pulse">
                                                {t.speaking}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mini Map / Progress / Next Up */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 font-sans tracking-tight shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex justify-between items-center">
                        {t.nextUp}
                        {status === 'completed' && <span className="text-red-500 text-[10px]">ENDED</span>}
                    </h3>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none masked-overflow">
                        {(status === 'completed' || status === 'paused') ? (
                            <div className="text-xs text-zinc-400 italic w-full text-center py-2">
                                {status === 'completed' ? (language === 'zh' ? '讨论已结束' : 'Discussion Ended') : (language === 'zh' ? '讨论暂停中' : 'Discussion Paused')}
                            </div>
                        ) : (
                            <NextSpeakerQueue agents={agents} userRole={userRole} language={language} currentTurn={currentTurn} topic={topic} mode={debateMode} />
                        )}
                    </div>
                </div>
            </aside >

        </div >
    );
}

function ArrowRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    )
}

function NextSpeakerQueue({ agents, userRole, language, currentTurn, topic, mode }: { agents: IAgent[], userRole: string, language: string, currentTurn: string | null, topic: string, mode: IRoomState['debateMode'] }) {
    // We utilize a dummy state to force re-render when external state changes if needed, 
    // but here we just derive from props.

    // Construct a temporary state object to pass to getUpcomingSpeakers
    // We only need the fields that the function uses
    const mockState: Partial<IRoomState> = {
        agents,
        userRole: userRole as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        currentTurn,
        debateMode: mode,
        currentStage: useRoomStore.getState().currentStage // Accessing store directly for complex deep props
    };

    const upcomingIds = getUpcomingSpeakers(mockState as IRoomState, 4);

    if (upcomingIds.length === 0) return <div className="text-xs text-zinc-400">...</div>;

    return (
        <div className="flex items-center gap-2">
            <AnimatePresence mode='popLayout'>
                {upcomingIds.map((id, index) => {
                    // Handle "user" specially
                    let agent = agents.find((a) => a.id === id);
                    if (id === 'user') {
                        agent = {
                            id: 'user',
                            name: language === 'zh' ? '您' : 'You',
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=You`,
                            role: 'participant',
                            modelId: 'Human',
                            providerId: 'manual',
                            color: '#2563eb',
                            systemPrompt: '',
                            temperature: 0
                        } as unknown as IAgent;
                    }
                    if (!agent) return null;

                    return (
                        <motion.div
                            key={`${id}-${index}`} // Use index in key to distinguish same speaker appearing multiple times in queue
                            initial={{ opacity: 0, scale: 0.8, x: 20 }}
                            animate={{
                                opacity: 1 - (index * 0.25),
                                scale: 1 - (index * 0.1),
                                x: 0
                            }}
                            exit={{ opacity: 0, scale: 0.5, x: -20 }}
                            layout
                            className={`relative flex flex-col items-center shrink-0 ${index === 0 ? 'z-10' : 'z-0 grayscale'}`}
                        >
                            <div className={`w-8 h-8 rounded-full border-2 overflow-hidden ${index === 0 ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'border-zinc-300 dark:border-zinc-700'}`}>
                                <img src={agent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.id}`} className="w-full h-full object-cover" />
                            </div>
                            {index === 0 && (
                                <span className="absolute -bottom-4 text-[9px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 rounded-full whitespace-nowrap max-w-20 truncate" title={agent.name}>
                                    {language === 'zh' ? `下一位：${agent.name}` : `Next: ${agent.name}`}
                                </span>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
            <div className="w-8 flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                <ArrowRightIcon />
            </div>
        </div>
    );
}
