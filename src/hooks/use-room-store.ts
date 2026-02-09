
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IAgent, IMessage, IRoomState, RoomStatus, UserRole } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface RoomStore extends IRoomState {
    // Actions
    setTopic: (topic: string) => void;
    setUserRole: (role: UserRole) => void;

    addAgent: (agent: IAgent) => void;
    updateAgent: (id: string, updates: Partial<IAgent>) => void;
    removeAgent: (id: string) => void;

    addMessage: (message: Omit<IMessage, "id" | "timestamp"> & { id?: string }) => void;
    updateMessage: (id: string, content: string, isThinking?: boolean) => void;

    setStatus: (status: RoomStatus) => void;
    setTurn: (agentId: string | null) => void;

    setDebateMode: (mode: IRoomState['debateMode']) => void;
    setMaxRounds: (rounds: number) => void;
    setCurrentRound: (round: number) => void;
    setCurrentStage: (stage: IRoomState['currentStage']) => void;
    setIsEnding: (isEnding: boolean) => void;

    resetRoom: () => void;
}

const initialState: IRoomState = {
    id: "default-room",
    name: "New Debate Room",
    topic: "",
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
};

export const useRoomStore = create<RoomStore>()(
    persist(
        (set) => ({
            ...initialState,

            setTopic: (topic) => set({ topic }),
            setUserRole: (userRole) => set({ userRole }),

            addAgent: (agent) =>
                set((state) => ({
                    agents: [...state.agents, agent],
                })),

            updateAgent: (id, updates) =>
                set((state) => ({
                    agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
                })),

            removeAgent: (id) =>
                set((state) => ({
                    agents: state.agents.filter((a) => a.id !== id),
                })),

            addMessage: (msg: Omit<IMessage, "id" | "timestamp"> & { id?: string }) =>
                set((state) => ({
                    history: [
                        ...state.history,
                        { ...msg, id: msg.id || uuidv4(), timestamp: Date.now() } as IMessage,
                    ],
                })),

            updateMessage: (id, content, isThinking) =>
                set((state) => ({
                    history: state.history.map((m) =>
                        m.id === id ? { ...m, content, isThinking: isThinking ?? m.isThinking } : m
                    ),
                })),

            setStatus: (status) => set({ status }),
            setTurn: (currentTurn) => set({ currentTurn }),

            setDebateMode: (debateMode) => set({ debateMode }),
            setMaxRounds: (maxRounds) => set({ maxRounds }),
            setCurrentRound: (currentRound) => set({ currentRound }),
            setCurrentStage: (currentStage) => set({ currentStage }),
            setIsEnding: (isEnding) => set({ isEnding }),

            resetRoom: () => set(initialState),
        }),
        {
            name: "chaoslm-room-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
