"use client";

import { useEffect, useRef } from "react";
import { useRoomStore } from "@/hooks/use-room-store";
import { useConductor } from "@/hooks/use-conductor";
import { Play, Pause, Mic, User, Bot, MessageSquare, List, Trash2, BrainCircuit, RotateCcw, AlertTriangle, AlertCircle, Download as LucideDownload, Upload as LucideUpload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper to render content with active URL linking and Thinking support
const renderMessageContent = (text: string) => {
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

    return (
        <div className="space-y-2">
            {thinkingContent && (
                <details className="group border border-zinc-200 dark:border-zinc-700/50 rounded-lg overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/30 transition-all duration-300">
                    <summary className="flex items-center gap-2 p-2 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer list-none select-none transition-colors border-b border-transparent group-open:border-zinc-200 dark:group-open:border-zinc-700/50">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                                <BrainCircuit className="w-3 h-3 text-blue-500" />
                            </div>
                            <span>Thinking Process</span>
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
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {mainContent}
                        </ReactMarkdown>
                    </div>
                ) : (
                    thinkingContent ? <span className="text-zinc-400 italic text-sm animate-pulse flex items-center gap-2"><Bot className="w-4 h-4" /> Generating final response...</span> : ""
                )}
            </div>
        </div>
    );
};

export function ChatArena() {
    const { agents, history, status, setStatus, currentTurn, userRole, topic, name, resetRoom, importRoom, debateMode, currentRound, maxRounds, currentStage, id, isEnding } = useRoomStore();
    const router = useRouter(); // Import at top
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
    // If userRole is observer, they might not be in the turn order (handled by scheduler), but we list them?
    // Actually, observers shouldn't be in the turn order list if they don't speak.
    // But let's list everyone present.
    const participants = [
        ...agents,
        ...(userRole !== 'observer' ? [{
            id: 'user',
            name: 'You',
            role: userRole,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
            color: '#2563eb',
            modelId: 'Human',
            providerId: 'manual'
        }] : [])
    ];

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans">

            {/* LEFT COLUMN: Sessions (Sidebar) */}
            <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col hidden md:flex">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <List className="w-5 h-5 text-zinc-500" />
                        <h2 className="font-semibold text-sm">Sessions</h2>
                    </div>
                    {/* Import Button */}
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
                                        alert("Session imported successfully!");
                                    } else {
                                        throw new Error("Invalid session format");
                                    }
                                } catch (err) {
                                    alert("Failed to import session: " + err);
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
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {/* Placeholder for session list */}
                    <div className="group p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-sm cursor-pointer border border-blue-200 dark:border-blue-800 relative">
                        <div className="font-medium truncate pr-12">{topic || "Untitled Debate"}</div>
                        <div className="text-xs opacity-70 truncate">{new Date().toLocaleDateString()}</div>

                        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Export Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const roomState = {
                                        id, name, topic, userRole, agents, history, status, currentTurn,
                                        debateMode, maxRounds, currentRound, currentStage, isEnding
                                    };
                                    const blob = new Blob([JSON.stringify(roomState, null, 2)], { type: "application/json" });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `${topic || 'debate'}_session_${new Date().getTime()}.json`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                                title="Export Session"
                            >
                                <LucideDownload className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("End session and delete data?")) {
                                        resetRoom();
                                        router.push("/");
                                    }
                                }}
                                className="p-1 text-blue-400 hover:text-red-500 transition-colors"
                                title="Delete Session"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* CENTER COLUMN: Chat Arena */}
            <main className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-black/50 relative">
                {/* Error Banner */}
                {history.length > 0 && history[history.length - 1].content.startsWith("Error:") && status === 'paused' && (
                    <div className="absolute top-16 left-0 right-0 z-20 bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-top-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{history[history.length - 1].content}</span>
                        <button
                            onClick={() => setStatus('active')}
                            className="ml-4 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs uppercase tracking-wider"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Header */}
                <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div>
                        <h1 className="font-bold text-lg truncate max-w-[300px]">{topic || "Debate Arena"}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                {debateMode} mode
                                {debateMode === 'custom' && ` (${currentRound}/${maxRounds})`}
                                {debateMode === 'classic' && ` (${currentStage.replace('_', ' ')})`}
                            </span>
                            <span className="text-[10px] text-zinc-400 capitalize">• {status}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Stop Button (visible when generating) */}
                        {isGenerating && (
                            <button
                                onClick={stop}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-zinc-100 dark:bg-zinc-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 transition-all shadow-sm"
                                title="Emergency Stop"
                            >
                                <div className="w-3 h-3 bg-red-500 rounded-sm animate-pulse" /> Stop
                            </button>
                        )}

                        {/* End Debate: Prominent if history started */}
                        {history.length > 0 && status !== 'completed' && (
                            <button
                                onClick={() => {
                                    if (confirm("Stop everything and let the Moderator provide a final summary?")) {
                                        endDebate();
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:opacity-90 transition-all shadow-md group"
                            >
                                <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                                <span>End Debate</span>
                            </button>
                        )}

                        {userRole === 'host' && (
                            <button
                                onClick={toggleStatus}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${status === 'active' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                                {status === 'active' ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
                            </button>
                        )}
                    </div>
                </header>

                {/* Error Banner */}
                {lastError && (
                    <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{lastError}</span>
                        </div>
                        <button
                            onClick={restartTurn}
                            className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry Turn
                        </button>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                    {history.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p>Waiting for the debate to begin...</p>
                            {userRole === 'host' && status !== 'active' && (
                                <p className="text-sm mt-2">Click "Start" to begin.</p>
                            )}
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {history.map((msg) => {
                            let sender = participants.find(p => p.id === msg.senderId) || agents.find(a => a.id === msg.senderId);

                            // Handle System
                            if (msg.senderId === 'system') {
                                sender = { id: 'system', name: 'System', avatar: '', role: 'system', color: '#999' } as any;
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
                                                    <span className={`font-bold ${isMe ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"}`}>{sender?.name || 'Unknown'}</span>
                                                    {sender?.role === 'host' && (
                                                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded uppercase tracking-wider">
                                                            Moderator
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
                                            {msg.content ? renderMessageContent(msg.content) : <span className="italic opacity-70 animate-pulse">Thinking...</span>}

                                            {/* Metrics Row */}
                                            {!isMe && msg.senderId !== 'system' && (msg.tokens || msg.duration) && (
                                                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-700/50 flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                                                    <div className="flex items-center gap-1">
                                                        <span className="opacity-50">Tokens:</span>
                                                        <span className="text-zinc-500 dark:text-zinc-300">{msg.tokens || '?'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="opacity-50">Latency:</span>
                                                        <span className="text-zinc-500 dark:text-zinc-300">{((msg.duration || 0) / 1000).toFixed(1)}s</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="opacity-50">Model:</span>
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

                {/* Input (Only for Human Participants/Hosts) */}
                {(userRole === 'host' || userRole === 'participant') && (
                    <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                        <div className="max-w-3xl mx-auto flex gap-2">
                            <input
                                disabled={status === 'active' && currentTurn !== 'user'}
                                placeholder={status === 'active' && currentTurn !== 'user' ? `Waiting for ${agents.find(a => a.id === currentTurn)?.name || 'others'}...` : "Type your message..."}
                                className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-60"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        // Handle send logic
                                        // We need to implement handleUserMessage in useConductor or expose addMessage here
                                        // Ideally useConductor handles the "User Turn" detection.
                                    }
                                }}
                            />
                            <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                <ArrowRightIcon />
                            </button>
                        </div>
                        <div className="text-center mt-2 text-xs text-zinc-400">
                            {status === 'active' ? "Live Mode: Turns are enforced." : "Paused: You can configure the room."}
                        </div>
                    </div>
                )}
            </main>

            {/* RIGHT COLUMN: Participants & State */}
            <aside className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 hidden lg:flex">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="font-semibold text-sm">Participants</h2>
                    <p className="text-xs text-zinc-500">{participants.length} Active</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                                        <div className="text-[10px] text-zinc-400 truncate opacity-70 group-hover:opacity-100 transition-opacity">
                                            {p.modelId} ({p.providerId})
                                        </div>
                                        {/* Animation Bars */}
                                        {isCurrentTurn && (
                                            <div className="flex gap-0.5 items-end h-3">
                                                <span className="w-0.5 bg-green-500 animate-[music-bar-1_0.6s_ease-in-out_infinite] h-2 rounded-full"></span>
                                                <span className="w-0.5 bg-green-500 animate-[music-bar-2_0.6s_ease-in-out_infinite_0.1s] h-3 rounded-full"></span>
                                                <span className="w-0.5 bg-green-500 animate-[music-bar-1_0.6s_ease-in-out_infinite_0.2s] h-1.5 rounded-full"></span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                            {p.role}
                                        </span>

                                        {isCurrentTurn && (
                                            <span className="text-[10px] text-green-600 font-medium animate-pulse">
                                                Speaking...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mini Map / Progress / Next Up */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Next Up</h3>
                    {/* Logic to show next speakers? strict round robin implies next in list? */}
                    <div className="flex -space-x-2">
                        {/* Just show a few avatars as preview */}
                        {participants.map(p => (
                            <img key={p.id} src={p.avatar} className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 grayscale opacity-50" />
                        ))}
                    </div>
                </div>
            </aside>

        </div>
    );
}

function ArrowRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    )
}
