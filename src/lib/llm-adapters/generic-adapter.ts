import OpenAI from "openai";
import { IMessage } from "@/types";
import { ILLMProvider, IModelInfo, StreamChunk } from "./types";

interface GenericAdapterConfig {
    id: string;
    name: string;
    baseURL?: string;
    defaultModels?: string[];
}

export class GenericOpenAIAdapter implements ILLMProvider {
    id: string;
    name: string;
    private baseURL?: string;
    public readonly defaultModels: string[];

    constructor(config: GenericAdapterConfig) {
        this.id = config.id;
        this.name = config.name;
        this.baseURL = config.baseURL;
        this.defaultModels = config.defaultModels || [];
    }

    async listModels(apiKey: string): Promise<IModelInfo[]> {
        // If we have default models and no API key (or if listing fails), we might want to return defaults?
        // But usually we try to fetch.
        // Special case: Ollama doesn't need API Key sometimes.

        try {
            const client = new OpenAI({
                apiKey: apiKey || "dummy", // Ollama needs a dummy key if none provided
                baseURL: this.baseURL,
                dangerouslyAllowBrowser: true // We are running this server-side usually, but if client-side... 
                // Wait, these adapters are imported in API routes (server) AND possibly client? 
                // The prompt says "server-side only" comment in original file.
                // But let's keep it safe.
            });

            const response = await client.models.list();

            const fetchedModels = response.data.map((model) => ({
                id: model.id,
                name: model.id,
                provider: this.id,
                contextWindow: 128000,
            }));

            // Merge with defaults if they don't exist? Or just return fetched?
            // If fetch yields empty (unlikely if successful), return defaults.
            // Actually, for some providers (like Azure or strict proxies), list might fail.
            // If list succeeds, use it.
            return fetchedModels.sort((a, b) => a.id.localeCompare(b.id));

        } catch (error) {
            console.warn(`Failed to list models for ${this.id}:`, error);
            // Fallback to default models if available
            if (this.defaultModels.length > 0) {
                return this.defaultModels.map(m => ({
                    id: m,
                    name: m,
                    provider: this.id,
                    contextWindow: 128000
                }));
            }
            throw error;
        }
    }

    async chatStream(
        modelId: string,
        messages: IMessage[],
        systemPrompt: string,
        apiKey: string,
        onChunk: (chunk: StreamChunk) => void,
        temperature?: number
    ): Promise<string> {
        const client = new OpenAI({
            apiKey: apiKey || "dummy",
            baseURL: this.baseURL
        });

        const formattedMessages = [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
                role: m.role as "user" | "assistant" | "system",
                content: m.content,
            })),
        ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

        try {
            // Special handling for DeepSeek Reasoner which doesn't support temperature
            const isDeepSeekReasoner = modelId === "deepseek-reasoner";

            const stream = await client.chat.completions.create({
                model: modelId,
                messages: formattedMessages,
                stream: true,
                temperature: isDeepSeekReasoner ? undefined : (temperature ?? 1.0),
            });

            let fullContent = "";

            for await (const chunk of stream) {
                // OpenAI standard: content in choices[0].delta.content
                // DeepSeek R1: reasoning_content in choices[0].delta.reasoning_content
                const delta = chunk.choices[0]?.delta as any;

                const content = delta?.content || "";
                const reasoning = delta?.reasoning_content || "";

                if (reasoning) {
                    // We can emit thinking chunks?
                    onChunk({ content: reasoning, isThinking: true });
                }

                if (content) {
                    fullContent += content;
                    onChunk({ content, isThinking: false });
                }
            }

            return fullContent;
        } catch (error) {
            console.error(`${this.name} Stream Error`, error);
            if (error instanceof Error) {
                console.error("Stack:", error.stack);
            }
            throw error;
        }
    }
}
