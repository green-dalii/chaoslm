import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IAgent, IMessage, IRoomState, RoomStatus, UserRole } from "@/types";
import { v4 as uuidv4 } from "uuid";

export interface RoomStore extends IRoomState {
    sessions: IRoomState[];
    activeSessionId: string;

    // Actions
    setActiveSession: (id: string) => void;
    createNewSession: () => void;
    deleteSession: (id: string) => void;

    setTopic: (topic: string) => void;
    setUserRole: (role: UserRole) => void;
    addAgent: (agent: IAgent) => void;
    updateAgent: (id: string, updates: Partial<IAgent>) => void;
    removeAgent: (id: string) => void;
    addMessage: (message: Omit<IMessage, "id" | "timestamp"> & { id?: string }) => void;
    updateMessage: (id: string, content: string, isThinking?: boolean, tokens?: number, duration?: number) => void;
    setStatus: (status: RoomStatus) => void;
    setTurn: (agentId: string | null) => void;
    setDebateMode: (mode: IRoomState['debateMode']) => void;
    setMaxRounds: (rounds: number) => void;
    setCurrentRound: (round: number) => void;
    setCurrentStage: (stage: IRoomState['currentStage']) => void;
    setIsEnding: (isEnding: boolean) => void;
    setBootstrapContext: (context: string) => void;

    resetRoom: () => void;
    importRoom: (state: IRoomState) => void;
}

const createSession = (topic = ""): IRoomState => ({
    id: uuidv4(),
    name: "New Discussion",
    topic,
    userRole: "participant",
    agents: [],
    history: [],
    status: "idle",
    currentTurn: null,
    debateMode: "standard",
    maxRounds: 3,
    currentRound: 1,
    currentStage: "introduction",
    isEnding: false,
});

const defaultSession = createSession();

export const useRoomStore = create<RoomStore>()(
    persist(
        (set) => ({
            ...defaultSession,
            sessions: [defaultSession],
            activeSessionId: defaultSession.id,

            setActiveSession: (id) => set((state) => {
                const session = state.sessions.find(s => s.id === id);
                if (!session) return state;
                return {
                    ...session,
                    activeSessionId: id
                };
            }),

            createNewSession: () => set((state) => {
                const newSession = createSession();

                // Sync current flattened state back to sessions list before switching
                const currentSession = extractSessionFields(state);
                const updatedSessions = state.sessions.map(s => s.id === state.id ? currentSession : s);

                // Ensure new session has completely fresh state with no inherited data
                const freshSession: IRoomState = {
                    ...newSession,
                    agents: [], // Explicitly ensure empty agents
                    history: [], // Explicitly ensure empty history
                    topic: "", // Ensure empty topic
                    status: 'idle',
                    currentTurn: null,
                    isEnding: false,
                };

                return {
                    ...freshSession,
                    sessions: [freshSession, ...updatedSessions],
                    activeSessionId: freshSession.id
                };
            }),

            deleteSession: (id) => set((state) => {
                const remainingSessions = state.sessions.filter(s => s.id !== id);
                if (remainingSessions.length === 0) {
                    const fresh = createSession();
                    return { ...fresh, sessions: [fresh], activeSessionId: fresh.id };
                }

                // Only switch active session if the one being deleted IS the active one
                if (id === state.activeSessionId) {
                    const nextSession = remainingSessions[0];
                    return {
                        ...nextSession,
                        sessions: remainingSessions,
                        activeSessionId: nextSession.id
                    };
                }

                return {
                    sessions: remainingSessions
                };
            }),

            setTopic: (topic) => set((state) => {
                const newState = { ...state, topic };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            setUserRole: (userRole) => set((state) => {
                const newState = { ...state, userRole };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            addAgent: (agent) => set((state) => {
                const newState = { ...state, agents: [...state.agents, agent] };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            updateAgent: (id, updates) => set((state) => {
                const newState = {
                    ...state,
                    agents: state.agents.map(a => a.id === id ? { ...a, ...updates } : a)
                };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            removeAgent: (id) => set((state) => {
                const newState = {
                    ...state,
                    agents: state.agents.filter(a => a.id !== id)
                };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            addMessage: (msg) => set((state) => {
                const newMessage = { ...msg, id: msg.id || uuidv4(), timestamp: Date.now() } as IMessage;
                const newState = { ...state, history: [...state.history, newMessage] };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            updateMessage: (id, content, isThinking, tokens, duration) => set((state) => {
                const newState = {
                    ...state,
                    history: state.history.map(m => m.id === id ? {
                        ...m, content, isThinking: isThinking ?? m.isThinking,
                        tokens: tokens ?? m.tokens, duration: duration ?? m.duration
                    } : m)
                };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            setStatus: (status) => set((state) => {
                const newState = { ...state, status };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            setTurn: (currentTurn) => set((state) => {
                const newState = { ...state, currentTurn };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            setDebateMode: (debateMode) => set((state) => {
                const newState = { ...state, debateMode };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            setMaxRounds: (maxRounds) => set((state) => {
                const newState = { ...state, maxRounds };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            setCurrentRound: (currentRound) => set((state) => {
                const newState = { ...state, currentRound };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            setCurrentStage: (currentStage) => set((state) => {
                const newState = { ...state, currentStage };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            setIsEnding: (isEnding) => set((state) => {
                const newState = { ...state, isEnding };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            setBootstrapContext: (bootstrapContext) => set((state) => {
                const newState = { ...state, bootstrapContext };
                return {
                    ...newState,
                    sessions: state.sessions.map(s => s.id === state.id ? extractSessionFields(newState) : s)
                };
            }),

            resetRoom: () => set((state) => {
                const fresh = createSession();
                return {
                    ...fresh,
                    sessions: state.sessions.map(s => s.id === state.id ? fresh : s)
                };
            }),

            importRoom: (newState) => set((state) => ({
                ...newState,
                sessions: [newState, ...state.sessions],
                activeSessionId: newState.id
            })),
        }),
        {
            name: "chaoslm-room-storage",
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                // Deduplicate sessions by id after rehydration
                if (state) {
                    const seenIds = new Set<string>();
                    const uniqueSessions = state.sessions.filter((s: IRoomState) => {
                        if (seenIds.has(s.id)) {
                            return false;
                        }
                        seenIds.add(s.id);
                        return true;
                    });
                    if (uniqueSessions.length !== state.sessions.length) {
                        state.sessions = uniqueSessions;
                    }
                }
            }
        }
    )
);

// Helper to extract only the IRoomState fields from the store state
function extractSessionFields(state: RoomStore): IRoomState {
    return {
        id: state.id,
        name: state.name,
        topic: state.topic,
        userRole: state.userRole,
        agents: state.agents,
        history: state.history,
        status: state.status,
        currentTurn: state.currentTurn,
        debateMode: state.debateMode,
        maxRounds: state.maxRounds,
        currentRound: state.currentRound,
        currentStage: state.currentStage,
        isEnding: state.isEnding,
        bootstrapContext: state.bootstrapContext
    };
}
