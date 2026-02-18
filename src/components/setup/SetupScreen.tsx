"use client";

import { useState, useMemo, useEffect } from "react";
import { useRoomStore, RoomStore } from "@/hooks/use-room-store";
import { useModelStore } from "@/hooks/use-model-store";
import { useSettingsStore, translations } from "@/hooks/use-settings-store";
import { v4 as uuidv4 } from "uuid";
import { ArrowRight, Plus, Trash2, Settings, User, Tv, Bot, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { IAgent, UserRole, IRoomState } from "@/types";

export function SetupScreen() {
    const router = useRouter();
    const { language, systemModel } = useSettingsStore();
    const t = translations[language].setup;
    const [step, setStep] = useState(1);
    const [localTopic, setLocalTopic] = useState("");
    const [localDescription, setLocalDescription] = useState("");
    const [localRole, setLocalRole] = useState<UserRole>("observer");
    const [localDebateMode, setLocalDebateMode] = useState<IRoomState['debateMode']>("standard");
    const [localMaxRounds, setLocalMaxRounds] = useState(3);

    const { providers } = useModelStore();

    // Host Config (if user is not host)
    const [hostProviderId, setHostProviderId] = useState("");
    const [hostModelId, setHostModelId] = useState("");
    const [hostTemperature, setHostTemperature] = useState(1.0);

    // Agent Form
    const [newAgentName, setNewAgentName] = useState("");
    const [selectedStance, setSelectedStance] = useState<'pro' | 'con' | 'neutral'>('neutral');
    const [selectedProvider, setSelectedProvider] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [localTemperature, setLocalTemperature] = useState(1.0);
    const [showAgentAdvanced, setShowAgentAdvanced] = useState(false);

    // Helper to get models for a provider
    const getModelsFor = (pid: string) => providers.find(p => p.id === pid)?.models || [];

    const {
        agents, addAgent, removeAgent, createNewSession, setTopic, setUserRole,
        setDebateMode, setMaxRounds, activeSessionId, topic, userRole, debateMode, maxRounds
    } = useRoomStore();

    const { isRefreshingModels } = useModelStore();

    // Sync local state when session changes
    useEffect(() => {
        setLocalTopic(topic || ""); // eslint-disable-line react-hooks/set-state-in-effect
        setLocalRole(userRole || "observer"); // Ensure default is observer
        setLocalDebateMode(debateMode || "standard");
        setLocalMaxRounds(maxRounds || 3);
        setStep(1); // Only reset to step 1 when the session ID changes
    }, [activeSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

    // 不再自动刷新模型列表，直接使用 /settings 中已配置的模型信息

    // Auto-fill AI Host config from systemModel when user selects non-host role
    useEffect(() => {
        if (localRole !== 'host' && systemModel) {
            setHostProviderId(systemModel.providerId); // eslint-disable-line react-hooks/set-state-in-effect
            setHostModelId(systemModel.modelId);
            setHostTemperature(systemModel.temperature || 1.0);
        }
    }, [localRole, systemModel]);

    const handleNextStep = () => {
        if (step === 1) {
            if (!localTopic.trim()) return;
            setTopic(localTopic);
            setUserRole(localRole);
            setDebateMode(localDebateMode);
            setMaxRounds(localMaxRounds);
            setStep(2);
        } else {
            // Start Debate
            if (agents.length < 1 && localRole !== 'observer') return;

            // Auto-add AI Host if user is not host
            if (localRole !== 'host' && !agents.some(a => a.role === 'host')) {
                if (!hostModelId) {
                    alert(language === 'zh' ? "请为 AI 主持人选择模型。" : "Please select a model for the AI Host.");
                    return;
                }

                const hostAgent: IAgent = {
                    id: uuidv4(),
                    name: language === 'zh' ? "主持人" : "Moderator",
                    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=Moderator`,
                    providerId: hostProviderId,
                    modelId: hostModelId,
                    systemPrompt: language === 'zh'
                        ? `你是一个关于"${localTopic}"辩论主题的严格但公正的主持人。你的目标是引导对话，确保各方观点都能被听到，并保持辩论的专注。首先介绍该主题。`
                        : `You are the strict but fair moderator for a discussion on the topic: "${localTopic}". Your goal is to guide the conversation, ensure all sides are heard, and keep the discussion focused. Start by introducing the topic.`,
                    role: 'host',
                    temperature: hostTemperature,
                    color: "#ef4444"
                };
                addAgent(hostAgent);
            }

            // CRITICAL FIX: Ensure consistent turn order by sorting agents
            // Host always comes first, then others by creation time (preserved)
            const currentAgents = useRoomStore.getState().agents;
            const sortedAgents = [...currentAgents].sort((a, b) => {
                if (a.role === 'host') return -1;
                if (b.role === 'host') return 1;
                return 0; // Keep original order for others
            });


            // Batch updates
            useRoomStore.setState((state: RoomStore) => ({
                ...state,
                agents: sortedAgents,
                status: 'active',
                bootstrapContext: undefined // FORCE regeneration of context with fresh participant list
            }));

            router.push("/arena");
        }
    };

    const handleAddAgent = () => {
        if (!selectedModel) {
            alert(language === 'zh' ? "请为智能体选择模型。" : "Please select a model for the agent.");
            return;
        }

        // Get base name (user input or model name)
        const baseName = newAgentName.trim() || selectedModel;

        // Check for duplicates and auto-deduplicate
        const existingNames = new Set(agents.map(a => a.name));
        let finalName = baseName;
        let counter = 1;

        while (existingNames.has(finalName)) {
            counter++;
            finalName = `${baseName}-${counter}`;
        }

        // Build auto prompt with description if provided
        let autoPrompt = "";
        const descriptionContext = localDescription.trim()
            ? (language === 'zh'
                ? `\n\n【重要背景信息】\n${localDescription}`
                : `\n\n[IMPORTANT CONTEXT]\n${localDescription}`)
            : "";

        if (localDebateMode === 'standard') {
            autoPrompt = language === 'zh'
                ? `你是 ${finalName}，正在参加一场关于 "${localTopic}" 的开放式、多视角讨论。请提供多样化、富有创意且发散性的观点。不要局限于单一立场。${descriptionContext}`
                : `You are ${finalName}, participating in an open, multi-perspective discussion on "${localTopic}". Provide diverse, creative, and divergent viewpoints. Do not feel restricted to a single side.${descriptionContext}`;
        } else {
            const stanceMapEn: Record<string, string> = { pro: "Affirmative (Pro)", con: "Opposition (Con)", neutral: "Neutral/Balanced" };
            const stanceMapZh: Record<string, string> = { pro: "正方", con: "反方", neutral: "中立/平衡" };
            const stanceStr = language === 'zh' ? stanceMapZh[selectedStance] : stanceMapEn[selectedStance];
            autoPrompt = language === 'zh'
                ? `你是 ${finalName}，正在参加一场关于 "${localTopic}" 的辩论。你被分配的立场是：${stanceStr}。请始终保持角色设置，并从该视角进行论证。${descriptionContext}`
                : `You are ${finalName}, participating in a debate on "${localTopic}". Your assigned stance is: ${stanceStr}. Always stay in character and argue from this perspective.${descriptionContext}`;
        }

        const newAgent: IAgent = {
            id: uuidv4(),
            name: finalName,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalName}`,
            providerId: selectedProvider,
            modelId: selectedModel,
            systemPrompt: autoPrompt,
            temperature: localTemperature,
            role: 'assistant',
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            stance: localDebateMode === 'standard' ? undefined : selectedStance
        };

        addAgent(newAgent);
        setNewAgentName("");
        setSelectedStance("neutral");
    };

    const activeProviders = useMemo(() => providers.filter(p => p.enabled || p.apiKey), [providers]);

    return (
        <div className="flex flex-1 flex-col w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-16 sm:pt-20 min-h-0 overflow-auto text-zinc-800 dark:text-zinc-200">
            <header className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl shadow-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-white dark:text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-0.5">{language === 'zh' ? '配置您的讨论环境' : 'Configure your discussion environment'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={createNewSession}
                        className="text-zinc-400 hover:text-red-500 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                    >
                        {language === 'zh' ? '新会话' : 'New Session'}
                    </button>
                    {/* Settings link moved to Navbar */}
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden min-h-0">
                {/* Left Column: Configuration Wizard */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                    {/* Step 1: Context */}
                    <div className={`p-6 rounded-2xl border transition-all duration-300 ${step === 1 ? 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-lg' : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 opacity-50 grayscale'}`}>
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-zinc-500'}`}>1</span>
                            {t.roomConfig}
                        </h2>

                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Topic & Description */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">{t.topicLabel}</label>
                                            <input
                                                className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-medium text-lg placeholder:text-zinc-400"
                                                placeholder={t.topicPlaceholder}
                                                value={localTopic}
                                                onChange={(e) => setLocalTopic(e.target.value)}
                                                autoFocus
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">
                                                {language === 'zh' ? '详细说明 (可选)' : 'Detailed Instructions (Optional)'}
                                            </label>
                                            <textarea
                                                className="w-full h-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-medium text-sm resize-none"
                                                placeholder={language === 'zh' ? '输入讨论指示、背景资料或详细规则...' : 'Enter instructions, background context, or detailed rules...'}
                                                value={localDescription}
                                                onChange={(e) => setLocalDescription(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column: Settings */}
                                    <div className="space-y-6">
                                        {/* Debate Mode */}
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">{t.debateMode}</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => setLocalDebateMode('standard')}
                                                    className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all text-center ${localDebateMode === 'standard' ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                                                >
                                                    {language === 'zh' ? '自由涌现' : 'Chaos Mode'}
                                                </button>
                                                <div className="relative group">
                                                    <button
                                                        disabled
                                                        className="w-full h-full py-3 px-2 rounded-xl border text-xs font-bold transition-all text-center bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                                                    >
                                                        {language === 'zh' ? '经典模式' : 'Classic Mode'}
                                                    </button>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        {language === 'zh' ? '开发中...' : 'Coming Soon...'}
                                                    </div>
                                                </div>
                                                <div className="relative group">
                                                    <button
                                                        disabled
                                                        className="w-full h-full py-3 px-2 rounded-xl border text-xs font-bold transition-all text-center bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                                                    >
                                                        {language === 'zh' ? '自定义' : 'Custom Mode'}
                                                    </button>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        {language === 'zh' ? '开发中...' : 'Coming Soon...'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center gap-2 mb-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                                                    <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                                                    {localDebateMode === 'standard' && (language === 'zh' ? '自由 / 混乱模式' : 'Chaos / Free Mode')}
                                                    {localDebateMode === 'classic' && (language === 'zh' ? '经典模式' : 'Classic Mode')}
                                                    {localDebateMode === 'custom' && (language === 'zh' ? '自定义模式' : 'Custom Mode')}
                                                </div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                    {localDebateMode === 'standard' && (language === 'zh' ? "无边界自由讨论，拥抱混乱与涌现。无固定立场，话题只是起点。" : "Unbounded discussion embracing chaos and emergence. No fixed stances—topic is just a starting point.")}
                                                    {localDebateMode === 'classic' && (language === 'zh' ? "正式结构：开场 -> 立论 -> 反驳 -> 自由辩论 -> 总结 -> 裁决。" : "Formal structure: Intro → Opening → Rebuttal → Free Debate → Summary → Verdict.")}
                                                    {localDebateMode === 'custom' && (language === 'zh' ? `每个参与者正好有 ${localMaxRounds} 轮发言机会。公平且受控。` : `Each participant gets exactly ${localMaxRounds} rounds to speak. Fair and controlled turns.`)}
                                                </p>
                                            </div>

                                            {localDebateMode === 'custom' && (
                                                <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                                    <label className="text-xs font-bold text-zinc-500 mb-1 block uppercase tracking-wider">{t.maxRounds}</label>
                                                    <input
                                                        type="number" min="1" max="50"
                                                        className="w-24 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold"
                                                        value={localMaxRounds}
                                                        onChange={(e) => setLocalMaxRounds(parseInt(e.target.value) || 1)}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* User Role */}
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">{t.yourRole}</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => setLocalRole('observer')}
                                                    className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${localRole === 'observer' ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                                                >
                                                    <Tv className="w-4 h-4" />
                                                    {language === 'zh' ? '观察员' : 'Observer'}
                                                </button>
                                                <button
                                                    onClick={() => setLocalRole('participant')}
                                                    className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${localRole === 'participant' ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                                                >
                                                    <User className="w-4 h-4" />
                                                    {language === 'zh' ? '参与者' : 'Participant'}
                                                </button>
                                                <button
                                                    onClick={() => setLocalRole('host')}
                                                    className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${localRole === 'host' ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    {language === 'zh' ? '主持人' : 'Host'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* AI Host Configuration - Show immediately when user is not host */}
                                        {localRole !== 'host' && (
                                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-widest">
                                                    <Bot className="w-3.5 h-3.5" />
                                                    {language === 'zh' ? 'AI 主持人' : 'AI Moderator'}
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    <div>
                                                        <select
                                                            className="w-full p-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-zinc-800 text-xs font-medium"
                                                            value={hostProviderId}
                                                            onChange={(e) => {
                                                                const pid = e.target.value;
                                                                setHostProviderId(pid);
                                                                setHostModelId(getModelsFor(pid)[0] || "");
                                                            }}
                                                        >
                                                            <option value="">{language === 'zh' ? '选择提供商...' : 'Select Provider...'}</option>
                                                            {activeProviders.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <select
                                                            className="w-full p-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-zinc-800 text-xs font-medium"
                                                            value={hostModelId}
                                                            onChange={(e) => setHostModelId(e.target.value)}
                                                            disabled={!hostProviderId}
                                                        >
                                                            <option value="">{language === 'zh' ? '选择模型...' : 'Select Model...'}</option>
                                                            {getModelsFor(hostProviderId).map(m => (
                                                                <option key={m} value={m}>{m}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <button
                                        onClick={handleNextStep}
                                        disabled={!localTopic.trim()}
                                        className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg"
                                    >
                                        {language === 'zh' ? '下一步' : 'Next Step'} <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Agents */}
                    <div className={`p-6 rounded-2xl border transition-all duration-300 min-h-0 ${step === 2 ? 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-lg' : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 opacity-50 grayscale'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-zinc-500'}`}>2</span>
                                {t.agentsTitle}
                            </h2>
                            {step === 2 && (
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-zinc-500 text-sm font-bold hover:text-zinc-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    {t.back}
                                </button>
                            )}
                        </div>

                        {step === 2 && (
                            <div className="flex-1 flex flex-col gap-6 min-h-0 animate-in fade-in slide-in-from-bottom-2">
                                {/* Scrollable Content Area */}
                                <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 min-h-0">
                                    {/* Host Model Selection (Conditional) */}

                                    {/* Member Builder */}
                                    <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> {t.addAgent}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className={localDebateMode === 'standard' ? 'col-span-2' : 'col-span-1'}>
                                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">{language === 'zh' ? '名称 / 设定' : 'Name / Persona'}</label>
                                                <input
                                                    className="w-full p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                                                    placeholder={language === 'zh' ? '留空则使用模型名称 (如重复会自动区分)' : 'Leave empty to use model name (auto-dedup if duplicate)'}
                                                    value={newAgentName}
                                                    onChange={(e) => setNewAgentName(e.target.value)}
                                                />
                                            </div>
                                            {localDebateMode !== 'standard' && (
                                                <div className="col-span-1">
                                                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">{language === 'zh' ? '立场' : 'Stance'}</label>
                                                    <div className="flex gap-1">
                                                        {(['pro', 'con', 'neutral'] as const).map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => setSelectedStance(s)}
                                                                className={`flex-1 py-1 px-2 text-[10px] font-bold rounded capitalize border transition-all ${selectedStance === s ? 'bg-black text-white dark:bg-white dark:text-black border-black' : 'bg-white dark:bg-zinc-800 border-zinc-200 text-zinc-400'}`}
                                                            >
                                                                {language === 'zh' ? (s === 'pro' ? '正方' : (s === 'con' ? '反方' : '中立')) : s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1">
                                                    Provider
                                                    {isRefreshingModels && (
                                                        <span className="inline-flex items-center gap-1 text-blue-500 animate-pulse">
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            <span className="text-[9px]">{language === 'zh' ? '刷新中...' : 'Refreshing...'}</span>
                                                        </span>
                                                    )}
                                                </label>
                                                <select
                                                    className="w-full p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                                                    value={selectedProvider}
                                                    onChange={(e) => {
                                                        const pid = e.target.value;
                                                        setSelectedProvider(pid);
                                                        setSelectedModel(getModelsFor(pid)[0] || "");
                                                    }}
                                                >
                                                    <option value="">Select Provider</option>
                                                    {activeProviders.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Model</label>
                                                <select
                                                    className="w-full p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                                                    value={selectedModel}
                                                    onChange={(e) => setSelectedModel(e.target.value)}
                                                >
                                                    <option value="">Select Model</option>
                                                    {getModelsFor(selectedProvider).map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <button onClick={() => setShowAgentAdvanced(!showAgentAdvanced)} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-tighter">
                                            {showAgentAdvanced ? (t.hideAdvanced as any) : (t.showAdvanced as any) /* eslint-disable-line @typescript-eslint/no-explicit-any */}
                                        </button>

                                        {showAgentAdvanced && (
                                            <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-1">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Temperature: {localTemperature}</label>
                                                    <input
                                                        type="range" min="0" max="2" step="0.1"
                                                        className="w-full accent-black dark:accent-white"
                                                        value={localTemperature}
                                                        onChange={(e) => setLocalTemperature(parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleAddAgent}
                                            disabled={!selectedModel}
                                            className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                                        >
                                            <Plus className="w-4 h-4" /> {t.addAgent}
                                        </button>
                                    </div>
                                </div>{/* End of scrollable content area */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Persistent Status Preview */}
                <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto lg:overflow-hidden shrink-0">
                    <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-xl min-h-[400px]">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                            <Tv className="w-4 h-4" /> {language === 'zh' ? '实时预览' : 'Live Preview'}
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                            {/* ... topic and role display ... */}
                            <div className="space-y-4">
                                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">Discussion Topic</span>
                                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 italic leading-relaxed">
                                    {localTopic || (language === 'zh' ? "尚未设定主题" : "No topic set yet")}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-zinc-400">Mode</span>
                                    <div className="text-xs font-bold capitalize bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md inline-block">
                                        {localDebateMode}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-zinc-400">User Role</span>
                                    <div className="text-xs font-bold capitalize bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md inline-block">
                                        {localRole}
                                    </div>
                                </div>
                            </div>

                            {/* Members List */}
                            {agents.length > 0 && (
                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-tighter mb-3 block">
                                        {language === 'zh' ? `已添加成员 (${agents.length})` : `Added Members (${agents.length})`}
                                    </span>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                                        {agents.map(agent => (
                                            <div key={agent.id} className="p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg flex items-center justify-between group">
                                                <div className="flex items-center gap-2">
                                                    <img src={agent.avatar} className="w-6 h-6 rounded-full bg-zinc-100" alt={agent.name} />
                                                    <div>
                                                        <div className="text-xs font-bold flex items-center gap-1.5">
                                                            {agent.name}
                                                            {agent.role === 'host' && <span className="text-[7px] bg-amber-100 text-amber-700 px-1 rounded uppercase">Host</span>}
                                                            {agent.stance && (
                                                                <span className={`text-[7px] px-1 rounded uppercase ${agent.stance === 'pro' ? 'bg-green-100 text-green-700' : (agent.stance === 'con' ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-700')}`}>
                                                                    {agent.stance}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[9px] text-zinc-400">{agent.modelId}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeAgent(agent.id)} className="p-1.5 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 mt-auto">
                                <button
                                    onClick={handleNextStep}
                                    disabled={agents.length === 0}
                                    className="w-full bg-green-600 dark:bg-green-500 text-white py-4 rounded-2xl text-lg font-extrabold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed group"
                                >
                                    {t.startDebate} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                                {agents.length === 0 && (
                                    <div className="mt-3 flex items-center justify-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                        <AlertCircle className="w-3 h-3" />
                                        {language === 'zh' ? '请至少添加一名成员' : 'Add at least 1 member'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
