import { GoogleGenerativeAI } from "@google/generative-ai";
import { IMessage } from "@/types";
import { ILLMProvider, IModelInfo, StreamChunk } from "./types";

export class GeminiAdapter implements ILLMProvider {
    id = "gemini";
    name = "Google Gemini";

    async listModels(apiKey: string): Promise<IModelInfo[]> {
        // Return curated list as SDK listing requires complex setup usually
        return [
            { id: "gemini-3-pro", name: "Gemini 3 Pro", provider: "gemini", contextWindow: 2000000 },
            { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "gemini", contextWindow: 1000000 },
            { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "gemini", contextWindow: 1000000 },
            { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "gemini", contextWindow: 1000000 },
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
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelId,
            systemInstruction: systemPrompt,
            generationConfig: {
                temperature: temperature ?? 1.0,
            }
        });

        // Format: Gemini uses 'user' and 'model' roles. System instruction is config.
        const history = messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content || " " }],
        }));

        const lastMsg = messages[messages.length - 1];
        if (!lastMsg) return ""; // Should not happen

        try {
            const chat = model.startChat({
                history: history,
                systemInstruction: systemPrompt,
            });

            const result = await chat.sendMessageStream(lastMsg.content || " ");

            let fullContent = "";

            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                    fullContent += text;
                    onChunk({ content: text, isThinking: false });
                }
            }

            return fullContent;
        } catch (error) {
            console.error("Gemini Stream Error", error);
            throw error;
        }
    }
}
