import { GenericOpenAIAdapter } from "./generic-adapter";
import { AnthropicAdapter } from "./anthropic";
import { GeminiAdapter } from "./gemini";
import { ILLMProvider } from "./types";

declare global {
    var lastAdapterError: any;
    var adapterStatus: string;
}

export * from "./types";
export * from "./generic-adapter";

let initialized = false;
export const availableProviders: ILLMProvider[] = [];

function initProviders() {
    if (initialized) return;
    console.log("[Adapters] Lazy initializing providers...");
    globalThis.adapterStatus = "initializing";

    try {
        availableProviders.push(new GenericOpenAIAdapter({
            id: "openai",
            name: "OpenAI",
            baseURL: "https://api.openai.com/v1"
        }));

        availableProviders.push(new AnthropicAdapter());

        availableProviders.push(new GeminiAdapter());

        availableProviders.push(new GenericOpenAIAdapter({
            id: "deepseek",
            name: "DeepSeek",
            baseURL: "https://api.deepseek.com",
            defaultModels: ["deepseek-chat", "deepseek-reasoner"]
        }));

        availableProviders.push(new GenericOpenAIAdapter({
            id: "kimi",
            name: "Kimi (Moonshot)",
            baseURL: "https://api.moonshot.cn/v1",
            defaultModels: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"]
        }));

        availableProviders.push(new GenericOpenAIAdapter({
            id: "minimax",
            name: "Minimax",
            baseURL: "https://api.minimax.io/v1",
            defaultModels: ["abab6.5-chat", "abab6.5s-chat"]
        }));

        availableProviders.push(new GenericOpenAIAdapter({
            id: "qwen",
            name: "Qwen (Alibaba)",
            baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
            defaultModels: ["qwen-plus", "qwen-turbo", "qwen-max"]
        }));

        availableProviders.push(new GenericOpenAIAdapter({
            id: "zhipu",
            name: "Zhipu (GLM)",
            baseURL: "https://open.bigmodel.cn/api/paas/v4",
            defaultModels: ["glm-4", "glm-4-air", "glm-3-turbo"]
        }));

        availableProviders.push(new GenericOpenAIAdapter({
            id: "ollama",
            name: "Ollama (Local)",
            baseURL: "http://localhost:11434/v1",
            defaultModels: ["llama3", "mistral", "gemma"]
        }));

        availableProviders.push(new GenericOpenAIAdapter({
            id: "openrouter",
            name: "OpenRouter",
            baseURL: "https://openrouter.ai/api/v1",
            defaultModels: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro-1.5"]
        }));

        availableProviders.push(new GenericOpenAIAdapter({
            id: "custom",
            name: "Custom OpenAI Compatible",
            baseURL: "",
        }));

        initialized = true;
        globalThis.adapterStatus = "success";
        console.log("[Adapters] All providers initialized successfully");
    } catch (error) {
        console.error("[Adapters] Critical failure:", error);
        globalThis.lastAdapterError = error;
        globalThis.adapterStatus = "failed";
    }
}

export function getProvider(providerId: string, configOffset?: { baseURL?: string }): ILLMProvider | undefined {
    initProviders();
    console.log(`[getProvider] Looking for ${providerId} with offset`, configOffset);
    const provider = availableProviders.find((p) => p.id === providerId);

    if (!provider) return undefined;

    // If we have an override and it's a GenericOpenAIAdapter, we might need a fresh instance?
    // Or we just rely on passing baseURL to listModels/chatStream if the interface supports it?
    // The 'listModels' and 'chatStream' in ILLMProvider do NOT take baseURL.
    // The GenericAdapter stores it.
    // So we MUST return a new instance if there's an override.

    if (configOffset?.baseURL && provider instanceof GenericOpenAIAdapter) {
        return new GenericOpenAIAdapter({
            id: provider.id,
            name: provider.name,
            baseURL: configOffset.baseURL,
            defaultModels: provider.defaultModels
        });
    }

    return provider;
}
