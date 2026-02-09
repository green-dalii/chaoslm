"use client";

import { useState, useMemo } from "react";
import { useModelStore } from "@/hooks/use-model-store";
import { Check, Loader2, Key, Globe, Plus, Trash2, ChevronDown, Monitor, Cpu } from "lucide-react";
import { IProviderConfig } from "@/types";

const PROVIDER_DEFAULTS: Record<string, string> = {
    "openai": "https://api.openai.com/v1",
    "deepseek": "https://api.deepseek.com", // v1 is optional or handled by client
    "kimi": "https://api.moonshot.cn/v1",
    "minimax": "https://api.minimax.io/v1", // Global endpoint
    "qwen": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1", // Alibaba Qwen
    "zhipu": "https://open.bigmodel.cn/api/paas/v4",
    "ollama": "http://localhost:11434/v1",
    "openrouter": "https://openrouter.ai/api/v1",
    "custom": "",
};

export function ModelManager() {
    const { providers, setApiKey, setBaseURL, updateModels, toggleProvider } = useModelStore();
    const [testingId, setTestingId] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);

    // Local state for the "Add Provider" dropdown
    const [isAdding, setIsAdding] = useState(false);

    // Filter providers that are "active" (have key or are enabled/visible)
    // For now, let's treat any provider with an API key OR that is 'ollama' (often no key) OR explicitly enabled as active.
    // Actually, let's simpler:
    // All start as "available to add". Once added (key set or enabled), they move to list.

    // Helper to determine if a provider is "configured"
    const isConfigured = (p: IProviderConfig) => {
        if (p.id === 'ollama') return p.enabled; // Ollama might be enabled without key
        return !!p.apiKey || p.enabled; // If key exists or flag is true
    };

    const configuredProviders = useMemo(() => providers.filter(isConfigured), [providers]);
    const availableProviders = useMemo(() => providers.filter(p => !isConfigured(p)), [providers]);

    // Handle adding a provider
    const handleAddProvider = (providerId: string) => {
        // Enable it and set default Base URL if needed
        const defaultUrl = PROVIDER_DEFAULTS[providerId];
        if (defaultUrl) {
            setBaseURL(providerId, defaultUrl);
        }
        toggleProvider(providerId, true);
    };

    const handleTestKey = async (providerId: string, apiKey: string, baseURL?: string) => {
        setTestingId(providerId);
        setStatusMsg(null);

        try {
            let url = `/api/models?providerId=${providerId}&apiKey=${apiKey}`;
            if (baseURL) {
                url += `&baseURL=${encodeURIComponent(baseURL)}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (res.ok && data.models) {
                setApiKey(providerId, apiKey);
                if (baseURL) setBaseURL(providerId, baseURL);

                const modelIds = data.models.map((m: any) => m.id);
                updateModels(providerId, modelIds);

                setStatusMsg({ id: providerId, msg: `Success! ${modelIds.length} models found.`, type: 'success' });
            } else {
                throw new Error(data.error || "Failed to fetch models");
            }
        } catch (error: any) {
            setStatusMsg({ id: providerId, msg: error.message, type: 'error' });
        } finally {
            setTestingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-full overflow-y-auto">
            <div className="shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Cpu className="w-5 h-5" /> Models & Keys
                </h2>
                <p className="text-sm text-zinc-500">
                    Connect your AI providers. Keys are stored locally.
                </p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Configured Providers List */}
                {configuredProviders.map((provider) => (
                    <div key={provider.id} className="group relative flex flex-col gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-all hover:shadow-md">

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {/* Icon placeholder */}
                                <div className="w-8 h-8 rounded-md bg-white dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    {provider.id === 'openai' ? '🤖' : provider.id === 'anthropic' ? '🧠' : provider.id === 'ollama' ? '🦙' : provider.id === 'openrouter' ? '🌐' : provider.id === 'qwen' ? '🇨🇳' : '☁️'}
                                </div>
                                <span className="font-semibold">{provider.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {provider.models && provider.models.length > 0 && (
                                    <span className="text-[10px] text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Ready
                                    </span>
                                )}
                                {/* Remove button (just clears key/hides) */}
                                <button
                                    onClick={() => {
                                        toggleProvider(provider.id, false);
                                    }}
                                    className="text-zinc-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove Provider"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Base URL Input */}
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/50 p-1 rounded border border-transparent focus-within:border-blue-500/50 transition-colors">
                            <Globe className="w-4 h-4 text-zinc-400 ml-2 shrink-0" />
                            <input
                                className="flex-1 bg-transparent text-xs px-2 py-1 outline-none font-mono text-zinc-600 dark:text-zinc-400 w-full"
                                placeholder="Base URL"
                                defaultValue={provider.baseURL || PROVIDER_DEFAULTS[provider.id] || ""}
                                onBlur={(e) => {
                                    if (e.target.value !== provider.baseURL) {
                                        setBaseURL(provider.id, e.target.value);
                                    }
                                }}
                            />
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="password"
                                placeholder={provider.id === 'ollama' ? "Skip Key (Local)" : "API Key"}
                                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                defaultValue={provider.apiKey}
                                onBlur={(e) => {
                                    if (e.target.value !== provider.apiKey) {
                                        setApiKey(provider.id, e.target.value);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const input = e.currentTarget;
                                        const urlInput = input.parentElement?.previousElementSibling?.querySelector('input') as HTMLInputElement | null;
                                        handleTestKey(provider.id, input.value, urlInput?.value);
                                    }
                                }}
                            />
                            <button
                                disabled={testingId === provider.id}
                                onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    const urlInput = input.parentElement?.previousElementSibling?.querySelector('input') as HTMLInputElement | null;
                                    handleTestKey(provider.id, input.value, urlInput?.value);
                                }}
                                className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 min-w-[70px] flex justify-center items-center shadow-sm"
                            >
                                {testingId === provider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                            </button>
                        </div>

                        {statusMsg?.id === provider.id && (
                            <p className={`text-xs px-1 ${statusMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {statusMsg.msg}
                            </p>
                        )}
                    </div>
                ))}

                {/* Add Provider Dropdown */}
                {availableProviders.length > 0 && (
                    <div className="relative group">
                        <select
                            className="appearance-none w-full bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-sm text-center text-zinc-500 font-medium hover:border-zinc-400 hover:text-zinc-700 cursor-pointer outline-none transition-colors"
                            onChange={(e) => {
                                const pid = e.target.value;
                                if (pid) {
                                    handleAddProvider(pid);
                                    // Reset select
                                    e.target.value = "";
                                }
                            }}
                            value=""
                        >
                            <option value="" disabled>+ Add AI Provider</option>
                            {availableProviders.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-50">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
