import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IProviderConfig } from "@/types";

interface ModelStore {
    providers: IProviderConfig[];
    isRefreshingModels: boolean;
    refreshError: string | null;

    // Actions
    setApiKey: (providerId: string, key: string) => void;
    setBaseURL: (providerId: string, url: string) => void;
    updateModels: (providerId: string, models: string[]) => void;
    toggleProvider: (providerId: string, enabled: boolean) => void;
    getProviderConfig: (providerId: string) => IProviderConfig | undefined;
    refreshAllModels: () => Promise<void>;
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
            isRefreshingModels: false,
            refreshError: null,

            refreshAllModels: async () => {
                const state = get();
                const providersToRefresh = state.providers.filter(
                    (p: IProviderConfig) => p.enabled && p.apiKey && p.apiKey !== 'ollama'
                );

                if (providersToRefresh.length === 0) return;

                set({ isRefreshingModels: true, refreshError: null });

                try {
                    const refreshPromises = providersToRefresh.map(async (provider: IProviderConfig) => {
                        try {
                            const params = new URLSearchParams({
                                providerId: provider.id,
                                apiKey: provider.apiKey,
                            });
                            if (provider.baseURL) {
                                params.append('baseURL', provider.baseURL);
                            }

                            const response = await fetch(`/api/models?${params}`);
                            if (!response.ok) {
                                console.warn(`Failed to refresh models for ${provider.id}:`, await response.text());
                                return null;
                            }

                            const data = await response.json();
                            // Extract model IDs from IModelInfo objects
                            const modelIds = Array.isArray(data.models)
                                ? data.models.map((m: any) => typeof m === 'string' ? m : m.id)
                                : [];
                            return { providerId: provider.id, models: modelIds };
                        } catch (err) {
                            console.warn(`Error refreshing models for ${provider.id}:`, err);
                            return null;
                        }
                    });

                    const results = await Promise.all(refreshPromises);

                    const validResults = results.filter((r): r is { providerId: string; models: string[] } =>
                        r !== null && Array.isArray(r.models)
                    );

                    if (validResults.length > 0) {
                        set((state: ModelStore) => ({
                            providers: state.providers.map(p => {
                                const result = validResults.find(r => r.providerId === p.id);
                                return result ? { ...p, models: result.models } : p;
                            }),
                        }));
                    }
                } catch (error) {
                    console.error('Failed to refresh models:', error);
                    set({ refreshError: 'Failed to refresh some model lists' });
                } finally {
                    set({ isRefreshingModels: false });
                }
            },

            setApiKey: (providerId: string, apiKey: string) =>
                set((state: ModelStore) => ({
                    providers: state.providers.map((p: IProviderConfig) =>
                        p.id === providerId ? { ...p, apiKey } : p
                    ),
                })),

            setBaseURL: (providerId: string, baseURL: string) =>
                set((state: ModelStore) => ({
                    providers: state.providers.map((p: IProviderConfig) =>
                        p.id === providerId ? { ...p, baseURL } : p
                    ),
                })),

            updateModels: (providerId: string, models: string[]) =>
                set((state: ModelStore) => ({
                    providers: state.providers.map((p: IProviderConfig) =>
                        p.id === providerId ? { ...p, models } : p
                    ),
                })),

            toggleProvider: (providerId: string, enabled: boolean) =>
                set((state: ModelStore) => ({
                    providers: state.providers.map((p: IProviderConfig) =>
                        p.id === providerId ? { ...p, enabled } : p
                    ),
                })),

            getProviderConfig: (providerId: string) =>
                get().providers.find((p: IProviderConfig) => p.id === providerId),
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
            }),
            merge: (persistedState: any, currentState: any) => {
                if (!persistedState || !persistedState.providers) return currentState;

                // Merge providers: keep default ones, overwrite with persisted ones if they exist
                const mergedProviders = [...currentState.providers];
                persistedState.providers.forEach((persisted: any) => {
                    const idx = mergedProviders.findIndex(p => p.id === persisted.id);
                    if (idx !== -1) {
                        // Update existing default with persisted data (keys, models, etc.)
                        mergedProviders[idx] = { ...mergedProviders[idx], ...persisted };
                    } else {
                        // If it's a "custom" provider added by user (not in current defaults), keep it?
                        // Actually our defaults include 'custom'.
                        mergedProviders.push(persisted);
                    }
                });

                return {
                    ...currentState,
                    ...persistedState,
                    providers: mergedProviders
                };
            }
        }
    )
);
