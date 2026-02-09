import { IMessage } from "@/types";

export interface IModelInfo {
    id: string;
    name: string;
    provider: string;
    contextWindow: number;
}

export type StreamChunk = {
    content: string;
    isThinking?: boolean;
};

export interface ILLMProvider {
    id: string; // 'openai', 'anthropic', etc.
    name: string;

    /**
     * Fetch available models from the provider.
     * Dynamic fetching ensures we don't hardcode lists.
     */
    listModels(apiKey: string): Promise<IModelInfo[]>;

    /**
     * Stream a chat completion.
     * @param modelId - The specific model to use (e.g., 'gpt-4')
     * @param messages - The history of messages
     * @param systemPrompt - The specific persona/instruction for this agent
     * @param apiKey - API key for the provider
     * @param onChunk - Callback for streaming content
     * @returns Complete message content when done
     */
    chatStream(
        modelId: string,
        messages: IMessage[],
        systemPrompt: string,
        apiKey: string,
        onChunk: (chunk: StreamChunk) => void,
        temperature?: number
    ): Promise<string>;
}
