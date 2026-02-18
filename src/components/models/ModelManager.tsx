"use client";

import { useState, useMemo } from "react";
import { useModelStore } from "@/hooks/use-model-store";
import { useSettingsStore } from "@/hooks/use-settings-store";
import { Trash2, Check, Globe, Key, Loader2, AlertCircle, ChevronDown, ChevronUp, Sparkles, Plus } from "lucide-react";
import { IProviderConfig } from "@/types";

const PROVIDER_DEFAULTS: Record<string, string> = {
    "openai": "https://api.openai.com/v1",
    "deepseek": "https://api.deepseek.com",
    "kimi": "https://api.moonshot.cn/v1",
    "minimax": "https://api.minimax.io/v1",
    "qwen": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    "zhipu": "https://open.bigmodel.cn/api/paas/v4",
    "ollama": "http://localhost:11434/v1",
    "openrouter": "https://openrouter.ai/api/v1",
    "custom": "",
};

// Provider 信息 - 包含名称和官方 favicon 图标 URL
const PROVIDER_INFO: Record<string, { name: string; iconUrl: string }> = {
    "openai": { name: "OpenAI", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" },
    "deepseek": { name: "DeepSeek", iconUrl: "https://www.deepseek.com/favicon.ico" },
    "kimi": { name: "Kimi", iconUrl: "https://kimi.moonshot.cn/favicon.ico" },
    "minimax": { name: "MiniMax", iconUrl: "https://www.minimax.io/favicon.ico" },
    "qwen": { name: "Qwen", iconUrl: "https://qianwen.aliyun.com/favicon.ico" },
    "zhipu": { name: "Zhipu AI", iconUrl: "https://www.zhipuai.cn/favicon.ico" },
    "ollama": { name: "Ollama", iconUrl: "https://ollama.com/favicon.ico" },
    "openrouter": { name: "OpenRouter", iconUrl: "https://openrouter.ai/favicon.ico" },
    "custom": { name: "Custom", iconUrl: "" },
};

export function ModelManager() {
    const { providers, setApiKey, setBaseURL, updateModels, toggleProvider } = useModelStore();
    const { language } = useSettingsStore();
    const [testingId, setTestingId] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);
    const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

    // 判断 Provider 是否已配置
    const isConfigured = (p: IProviderConfig) => {
        if (p.id === 'ollama') return p.enabled;
        return !!p.apiKey || p.enabled;
    };

    const configuredProviders = useMemo(() => providers.filter(isConfigured), [providers]);
    const availableProviders = useMemo(() => providers.filter(p => !isConfigured(p)), [providers]);

    const handleAddProvider = (providerId: string) => {
        const defaultUrl = PROVIDER_DEFAULTS[providerId];
        if (defaultUrl) {
            setBaseURL(providerId, defaultUrl);
        }
        toggleProvider(providerId, true);
        setExpandedProvider(providerId);
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

                setStatusMsg({ id: providerId, msg: `Success! ${modelIds.length} models`, type: 'success' });
            } else {
                throw new Error(data.error || "Failed to fetch models");
            }
        } catch (error: any) {
            setStatusMsg({ id: providerId, msg: error.message, type: 'error' });
        } finally {
            setTestingId(null);
        }
    };

    const toggleExpand = (providerId: string) => {
        setExpandedProvider(expandedProvider === providerId ? null : providerId);
    };

    const handleRemoveProvider = (providerId: string) => {
        toggleProvider(providerId, false);
        if (expandedProvider === providerId) {
            setExpandedProvider(null);
        }
    };

    // 渲染 Provider 图标
    const renderProviderIcon = (providerId: string, isConfigured: boolean) => {
        const info = PROVIDER_INFO[providerId];
        if (!info?.iconUrl) {
            // Custom 或没有图标的显示首字母
            return (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isConfigured ? 'bg-zinc-100 dark:bg-zinc-700' : 'bg-zinc-50 dark:bg-zinc-800'}`}>
                    <span className={`text-xs font-bold ${isConfigured ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400'}`}>
                        {info?.name?.charAt(0) || '+'}
                    </span>
                </div>
            );
        }

        return (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden`}>
                <img
                    src={info.iconUrl}
                    alt={info.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                        // 如果图片加载失败，显示首字母
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                            const fallback = document.createElement('span');
                            fallback.className = `text-xs font-bold ${isConfigured ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400'}`;
                            fallback.textContent = info.name?.charAt(0) || '+';
                            parent.appendChild(fallback);
                        }
                    }}
                />
            </div>
        );
    };

    // 渲染 Provider 按钮 - 使用统一的黑白灰配色
    const renderProviderButton = (provider: IProviderConfig, isConfigured: boolean) => {
        const isExpanded = expandedProvider === provider.id;
        const hasModels = provider.models && provider.models.length > 0;

        return (
            <div key={provider.id} className="relative">
                <button
                    onClick={() => toggleExpand(provider.id)}
                    className={`
                        w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all text-left
                        ${isExpanded
                            ? 'border-zinc-500 bg-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-300 dark:ring-zinc-600'
                            : isConfigured
                                ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600'
                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }
                    `}
                >
                    {/* 图标 */}
                    {renderProviderIcon(provider.id, isConfigured)}

                    {/* 名称和状态 */}
                    <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                            {PROVIDER_INFO[provider.id]?.name || provider.name}
                        </span>
                        {isConfigured && (
                            <span className={`text-[10px] flex items-center gap-0.5 ${hasModels ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400'}`}>
                                {hasModels ? <Check className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                                {hasModels ? (language === 'zh' ? '已就绪' : 'Ready') : (language === 'zh' ? '待验证' : 'Pending')}
                            </span>
                        )}
                    </div>

                    {/* 展开/收起图标 */}
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                </button>

                {/* 展开的配置面板 */}
                {isExpanded && (
                    <div className="mt-2 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        {/* Base URL */}
                        <div className="mb-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 ml-1">API Endpoint</label>
                            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-black/30 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-zinc-500/20 focus-within:border-zinc-500/50">
                                <Globe className="w-3 h-3 text-zinc-400 shrink-0" />
                                <input
                                    className="flex-1 bg-transparent text-xs outline-none font-mono text-zinc-700 dark:text-zinc-300"
                                    placeholder="Base URL"
                                    defaultValue={provider.baseURL || PROVIDER_DEFAULTS[provider.id] || ""}
                                    onBlur={(e) => {
                                        if (e.target.value !== provider.baseURL) {
                                            setBaseURL(provider.id, e.target.value);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* API Key */}
                        <div className="mb-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 ml-1">API Key</label>
                            <div className="flex gap-2">
                                <div className="flex-1 flex items-center bg-zinc-50 dark:bg-black/30 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-zinc-500/20 focus-within:border-zinc-500/50">
                                    <Key className="w-3 h-3 text-zinc-400 shrink-0" />
                                    <input
                                        type="password"
                                        placeholder={provider.id === 'ollama' ? "Skip Key (Local)" : "Enter Key..."}
                                        className="flex-1 bg-transparent text-xs outline-none text-zinc-900 dark:text-zinc-100"
                                        defaultValue={provider.apiKey}
                                        onBlur={(e) => {
                                            if (e.target.value !== provider.apiKey) {
                                                setApiKey(provider.id, e.target.value);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const input = e.currentTarget;
                                                const urlInput = input.closest('.bg-white')?.querySelector('input[placeholder="Base URL"]') as HTMLInputElement | null;
                                                handleTestKey(provider.id, input.value, urlInput?.value);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    disabled={testingId === provider.id}
                                    onClick={(e) => {
                                        const container = e.currentTarget.parentElement;
                                        const input = container?.querySelector('input[type="password"]') as HTMLInputElement;
                                        const urlInput = container?.closest('.bg-white')?.querySelector('input[placeholder="Base URL"]') as HTMLInputElement | null;
                                        handleTestKey(provider.id, input.value, urlInput?.value);
                                    }}
                                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-200 dark:hover:bg-zinc-300 disabled:bg-zinc-300 dark:disabled:bg-zinc-600 text-white dark:text-zinc-900 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                >
                                    {testingId === provider.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    {language === 'zh' ? '验证' : 'Verify'}
                                </button>
                            </div>
                        </div>

                        {/* 状态消息 */}
                        {statusMsg && statusMsg.id === provider.id && (
                            <div className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 ${statusMsg.type === 'success' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                                <AlertCircle className="w-3 h-3" />
                                {statusMsg.msg}
                            </div>
                        )}

                        {/* 已配置数量 */}
                        {isConfigured && provider.models && provider.models.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] text-zinc-500">
                                    {language === 'zh' ? '可用模型' : 'Available models'}: <span className="font-bold text-zinc-700 dark:text-zinc-300">{provider.models.length}</span>
                                </p>
                            </div>
                        )}

                        {/* 手动添加模型 */}
                        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 ml-1">
                                {language === 'zh' ? '手动添加模型' : 'Add Model Manually'}
                            </label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    placeholder={language === 'zh' ? '输入模型名称...' : 'Enter model name...'}
                                    className="flex-1 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-black/30 text-xs outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const input = e.currentTarget;
                                            const modelName = input.value.trim();
                                            if (modelName) {
                                                const currentModels = provider.models || [];
                                                if (!currentModels.includes(modelName)) {
                                                    updateModels(provider.id, [...currentModels, modelName]);
                                                }
                                                input.value = '';
                                            }
                                        }
                                    }}
                                />
                                <button
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        const modelName = input.value.trim();
                                        if (modelName) {
                                            const currentModels = provider.models || [];
                                            if (!currentModels.includes(modelName)) {
                                                updateModels(provider.id, [...currentModels, modelName]);
                                            }
                                            input.value = '';
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" />
                                    {language === 'zh' ? '添加' : 'Add'}
                                </button>
                            </div>
                        </div>

                        {/* 删除按钮 */}
                        <button
                            onClick={() => handleRemoveProvider(provider.id)}
                            className="mt-2 w-full py-1.5 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center justify-center gap-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                        >
                            <Trash2 className="w-3 h-3" />
                            {language === 'zh' ? '移除此提供商' : 'Remove Provider'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-3">
            {/* 已配置的 Provider */}
            {configuredProviders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {configuredProviders.map(p => renderProviderButton(p, true))}
                </div>
            )}

            {/* 可添加的 Provider 下拉框 */}
            {availableProviders.length > 0 && (
                <div className="relative">
                    <select
                        className="appearance-none w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-center text-xs text-zinc-500 font-bold hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer outline-none transition-all"
                        onChange={(e) => {
                            const pid = e.target.value;
                            if (pid) {
                                handleAddProvider(pid);
                                e.target.value = "";
                            }
                        }}
                        value=""
                    >
                        <option value="" disabled>{language === 'zh' ? '+ 添加 AI 提供商' : '+ Add AI Provider'}</option>
                        {availableProviders.map((p: IProviderConfig) => (
                            <option key={p.id} value={p.id}>{PROVIDER_INFO[p.id]?.name || p.name}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-50">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            )}

            {/* 空状态 */}
            {providers.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-xs text-zinc-400">{language === 'zh' ? '暂无可用提供商' : 'No providers available'}</p>
                </div>
            )}
        </div>
    );
}
