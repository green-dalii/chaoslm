export type Role = 'system' | 'user' | 'assistant' | 'host';
export type UserRole = 'host' | 'participant' | 'observer';

export interface IProviderConfig {
    id: string;
    name: string;
    apiKey: string; // Stored locally only
    baseURL?: string; // NEW: For valid overrides
    enabled: boolean;
    models?: string[]; // Cached list of models
}

export interface IAgent {
    id: string;
    name: string;
    avatar: string;
    providerId: string; // e.g., 'openai', 'anthropic'
    modelId: string;    // e.g., 'gpt-4o', 'claude-3-5-sonnet'
    systemPrompt: string;
    role: 'assistant' | 'host'; // NEW: specific agent role
    temperature: number;
    color?: string; // UI color for the agent
    stance?: 'pro' | 'con' | 'neutral'; // NEW: for structured debates
}

export interface IMessage {
    id: string;
    role: Role;
    senderId: string; // matches agent.id or 'user'
    content: string;
    timestamp: number;
    isThinking?: boolean; // True if the content is partially streamed reasoning
    tokens?: number;
    duration?: number; // ms
}

export type RoomStatus = 'idle' | 'active' | 'paused' | 'completed';
export type DebateMode = 'standard' | 'classic' | 'custom';
export type ClassicStage = 'introduction' | 'pro_opening' | 'con_opening' | 'pro_rebuttal' | 'con_rebuttal' | 'free' | 'pro_summary' | 'con_summary' | 'conclusion';

export interface IRoomState {
    id: string;
    name: string;
    topic: string; // NEW
    userRole: UserRole; // NEW
    agents: IAgent[];
    history: IMessage[];
    status: RoomStatus;
    currentTurn: string | null; // agent.id or 'user' or null

    // NEW: Debate Logic
    debateMode: DebateMode;
    maxRounds: number;    // For Custom Mode: total rounds per speaker
    currentRound: number;
    currentStage: ClassicStage;
    isEnding?: boolean;   // Manual override for "End Debate"

    // NEW: Bootstrap Context - System preparation material (not displayed to users)
    bootstrapContext?: string;
}

export interface IConductorConfig {
    maxTurns: number;
    contextWindow: number; // Max tokens before summarization
}
