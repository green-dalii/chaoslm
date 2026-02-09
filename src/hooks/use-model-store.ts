import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IProviderConfig } from "@/types";

interface ModelStore {
    providers: IProviderConfig[];

    // Actions
    setApiKey: (providerId: string, key: string) => void;
    setBaseURL: (providerId: string, url: string) => void;
    updateModels: (providerId: string, models: string[]) => void;
    toggleProvider: (providerId: string, enabled: boolean) => void; // NEW
    getProviderConfig: (providerId: string) => IProviderConfig | undefined;
}

// Default list matching the Registry
const defaultProviders: IProviderConfig[] = [
    { id: "openai", name: "OpenAI", apiKey: "", enabled: true, models: [] }, // OpenAI enabled by default
    { id: "anthropic", name: "Anthropic (Claude)", apiKey: "", enabled: false, models: [] },
    { id: "gemini", name: "Google Gemini", apiKey: "", enabled: false, models: [] },
    { id: "deepseek", name: "DeepSeek", apiKey: "", enabled: false, models: [] },
    { id: "kimi", name: "Kimi (Moonshot)", apiKey: "", enabled: false, models: [] },
    { id: "minimax", name: "Minimax", apiKey: "", enabled: false, models: [] },
    { id: "qwen", name: "Qwen (Alibaba)", apiKey: "", enabled: false, models: [] },
    { id: "zhipu", name: "Zhipu (GLM)", apiKey: "", enabled: false, models: [] },
    { id: "ollama", name: "Ollama (Local)", apiKey: "ollama", enabled: false, models: [] },
    { id: "openrouter", name: "OpenRouter", apiKey: "", enabled: false, models: [] },
    { id: "custom", name: "Custom (OpenAI Compatible)", apiKey: "", enabled: false, models: [] },
];

export const useModelStore = create<ModelStore>()(
    persist(
        (set, get) => ({
            providers: defaultProviders,

            setApiKey: (providerId, apiKey) =>
                set((state) => ({
                    providers: state.providers.map((p) =>
                        p.id === providerId ? { ...p, apiKey } : p
                    ),
                })),

            setBaseURL: (providerId, url) => {
                // This might require storing baseURL in IProviderConfig if not already present.
                // Let's assume user might want to override even default ones, or at least for Custom/Ollama.
                // But IProviderConfig didn't have baseURL field. 
                // We need to update IProviderConfig type first? 
                // Or just store it here and pass it when needed.
                // Actually, GenericOpenAIAdapter takes config in constructor.
                // But if we want dynamic baseURL from UI, we need to pass it to the API endpoint.
                // The API endpoint constructs the provider.
                // Currently `getProvider` returns a static instance.
                // To support dynamic baseURL, we need to pass it in the API call.
                return;
            },

            updateModels: (providerId, models) =>
                set((state) => ({
                    providers: state.providers.map((p) =>
                        p.id === providerId ? { ...p, models } : p
                    ),
                })),

            toggleProvider: (providerId, enabled) =>
                set((state) => ({
                    providers: state.providers.map((p) =>
                        p.id === providerId ? { ...p, enabled } : p
                    ),
                })),

            getProviderConfig: (providerId) =>
                get().providers.find(p => p.id === providerId),
        }),
        {
            name: "chaoslm-model-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist API keys and maybe cached models?
                // If we add new providers in code, they might not appear if we persist the whole `providers` array from old state.
                // We should merge defaultProviders with persisted state on hydration?
                // Zustand persist is simple JSON dump.
                // Strategy: We persist everything for now. User can "Reset" if needed.
                providers: state.providers
            })
        }
    )
);
