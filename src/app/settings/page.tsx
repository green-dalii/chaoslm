"use client";

import { ModelManager } from "@/components/models/ModelManager";
import { useSettingsStore, translations } from "@/hooks/use-settings-store";
import { useModelStore } from "@/hooks/use-model-store";
import { Settings, Shield, Cpu, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const { language, systemModel, setSystemModel, isSystemModelConfigured } = useSettingsStore();
    const { providers, refreshAllModels } = useModelStore();
    const t = translations[language].setup;

    const [selectedProvider, setSelectedProvider] = useState(systemModel?.providerId || "");
    const [selectedModel, setSelectedModel] = useState(systemModel?.modelId || "");
    const [temperature, setTemperature] = useState(systemModel?.temperature || 1.0);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    const getModelsFor = (pid: string) => providers.find(p => p.id === pid)?.models || [];
    const activeProviders = providers.filter(p => p.enabled || p.apiKey);

    // Refresh models when entering settings
    useEffect(() => {
        refreshAllModels();
    }, []);

    // Sync with store when systemModel changes
    useEffect(() => {
        if (systemModel) {
            setSelectedProvider(systemModel.providerId);
            setSelectedModel(systemModel.modelId);
            setTemperature(systemModel.temperature || 1.0);
        }
    }, [systemModel]);

    const handleSaveSystemModel = () => {
        if (!selectedProvider || !selectedModel) return;

        const provider = providers.find(p => p.id === selectedProvider);

        setSystemModel({
            providerId: selectedProvider,
            modelId: selectedModel,
            apiKey: provider?.apiKey,
            baseURL: provider?.baseURL,
            temperature: temperature
        });

        setIsSaving(true);
        setShowSaved(true);
        setTimeout(() => {
            setIsSaving(false);
            setTimeout(() => setShowSaved(false), 2000);
        }, 500);
    };

    const isConfigured = isSystemModelConfigured();

    return (
        <div className="flex flex-1 flex-col w-full max-w-6xl mx-auto px-3 sm:px-4 py-6 overflow-hidden text-zinc-900 dark:text-zinc-100">
            <header className="mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl shadow-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-white dark:text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{language === 'zh' ? '项目配置' : 'Project Settings'}</h1>
                        <p className="text-xs text-zinc-500 font-medium">
                            {language === 'zh' ? '管理 API 密钥、AI 模型提供商和 ChaosLM 系统配置' : 'Manage API keys, AI providers, and ChaosLM system configuration'}
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
                {/* 左侧：Provider 列表和系统模型并排 */}
                <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto pr-1">
                    {/* Model Providers - 先配置 Provider */}
                    <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-blue-500" />
                                {language === 'zh' ? '模型提供商' : 'Model Providers'}
                            </h2>
                            <span className="text-[10px] text-zinc-400 hidden sm:block">
                                {language === 'zh' ? '请先添加并配置您的 AI 提供商' : 'Add and configure your AI providers first'}
                            </span>
                        </div>
                        <div className="overflow-y-auto p-3" style={{ maxHeight: '320px' }}>
                            <ModelManager />
                        </div>
                    </div>

                    {/* ChaosLM System Model Configuration - 再配置系统模型 */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-zinc-800 dark:bg-zinc-200 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white dark:text-zinc-900" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                    {language === 'zh' ? 'ChaosLM 系统模型' : 'ChaosLM System Model'}
                                </h2>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {language === 'zh' ? '用于生成引导内容和系统提示' : 'For generating bootstrap content'}
                                </p>
                            </div>
                            {isConfigured ? (
                                <CheckCircle className="w-4 h-4 text-zinc-600 dark:text-zinc-400 ml-auto shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-zinc-400 ml-auto shrink-0" />
                            )}
                        </div>

                        {!isConfigured && (
                            <div className="mb-3 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                    {language === 'zh'
                                        ? '请先在上方配置 Provider，再选择模型'
                                        : 'Configure a Provider above, then select a model'}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                    {language === 'zh' ? '提供商' : 'Provider'}
                                </label>
                                <select
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all"
                                    value={selectedProvider}
                                    onChange={(e) => {
                                        const pid = e.target.value;
                                        setSelectedProvider(pid);
                                        setSelectedModel(getModelsFor(pid)[0] || "");
                                    }}
                                >
                                    <option value="">{language === 'zh' ? '选择...' : 'Select...'}</option>
                                    {activeProviders.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                    {language === 'zh' ? '模型' : 'Model'}
                                </label>
                                <select
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all disabled:opacity-50"
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    disabled={!selectedProvider}
                                >
                                    <option value="">{language === 'zh' ? '选择...' : 'Select...'}</option>
                                    {getModelsFor(selectedProvider).map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-2">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                Temperature: {temperature}
                            </label>
                            <input
                                type="range" min="0" max="2" step="0.1"
                                className="w-full accent-zinc-600 h-1.5"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            />
                            <div className="flex justify-between text-[9px] text-zinc-400 mt-0.5">
                                <span>{language === 'zh' ? '精确' : 'Precise'}</span>
                                <span>{language === 'zh' ? '平衡' : 'Balanced'}</span>
                                <span>{language === 'zh' ? '创意' : 'Creative'}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveSystemModel}
                            disabled={!selectedProvider || !selectedModel || isSaving}
                            className="w-full mt-3 py-2 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-200 dark:hover:bg-zinc-300 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white dark:text-zinc-900 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                            {showSaved ? (
                                <>
                                    <CheckCircle className="w-3 h-3" />
                                    {language === 'zh' ? '已保存!' : 'Saved!'}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3 h-3" />
                                    {language === 'zh' ? '保存配置' : 'Save Config'}
                                </>
                            )}
                        </button>

                        {systemModel && (
                            <div className="mt-2 p-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                <p className="text-[10px] text-zinc-500">{language === 'zh' ? '当前' : 'Current'}</p>
                                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                    {systemModel.providerId} / {systemModel.modelId}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 右侧：提示信息栏 */}
                <div className="w-full lg:w-64 shrink-0 space-y-3">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                            <Shield className="w-3 h-3" /> {language === 'zh' ? '安全与存储' : 'Security'}
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {language === 'zh'
                                ? 'API 密钥仅保存在浏览器 LocalStorage 中，不会上传服务器。'
                                : 'API keys stored locally in your browser, never uploaded.'}
                        </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                            {language === 'zh' ? '需要帮助？' : 'Need Help?'}
                        </h3>
                        <p className="text-[10px] text-blue-500/80 leading-relaxed">
                            {language === 'zh'
                                ? '无法连接时请检查网络或尝试使用代理 Base URL。'
                                : 'Check network or try a proxy Base URL if connection fails.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
