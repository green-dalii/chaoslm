import Anthropic from "@anthropic-ai/sdk";
import { IMessage } from "@/types";
import { ILLMProvider, IModelInfo, StreamChunk } from "./types";

export class AnthropicAdapter implements ILLMProvider {
    id = "anthropic";
    name = "Anthropic (Claude)";

    async listModels(apiKey: string): Promise<IModelInfo[]> {
        // Anthropic doesn't have a public list models API easily accessible via client? 
        // Actually it does, but for now we hardcode the popular ones as per most integrations.
        // Or we can try to fetch if SDK supports it. 
        // SDK doesn't have a robust 'list' method like OpenAI.
        // So we return a curated list.

        return [
            { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet", provider: "anthropic", contextWindow: 200000 },
            { id: "claude-3-opus-20240229", name: "Claude 3 Opus", provider: "anthropic", contextWindow: 200000 },
            { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", provider: "anthropic", contextWindow: 200000 },
            { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", provider: "anthropic", contextWindow: 200000 },
        ];
    }

    async chatStream(
        modelId: string,
        messages: IMessage[],
        systemPrompt: string,
        apiKey: string,
        onChunk: (chunk: StreamChunk) => void,
        temperature?: number
    ): Promise<string> {
        const anthropic = new Anthropic({
            apiKey: apiKey,
        });

        // Format messages: System is a separate parameter in Claude
        const formattedMessages = messages.map((m) => ({
            role: m.role === 'host' ? 'assistant' : (m.role === "assistant" ? "assistant" : "user"),
            content: m.content || " ", // Claude dislikes empty content
        })) as Anthropic.MessageParam[];

        try {
            const stream = anthropic.messages.stream({
                model: modelId,
                max_tokens: 4096,
                system: systemPrompt,
                messages: formattedMessages,
                stream: true,
            });

            let fullContent = "";

            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    const content = chunk.delta.text;
                    fullContent += content;
                    onChunk({ content, isThinking: false });
                }
            }

            return fullContent;
        } catch (error) {
            console.error("Anthropic Stream Error", error);
            throw error;
        }
    }
}
