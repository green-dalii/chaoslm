"use client";

import { useState, useMemo } from "react";
import { useRoomStore } from "@/hooks/use-room-store";
import { useModelStore } from "@/hooks/use-model-store";
import { v4 as uuidv4 } from "uuid";
import { ArrowRight, Plus, Trash2, Settings, User, Tv, Bot, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { IAgent, UserRole } from "@/types";
import { ModelManager } from "@/components/models/ModelManager";

export function SetupScreen() {
    const router = useRouter();
    const { agents, addAgent, removeAgent, resetRoom, setTopic, setUserRole, setStatus } = useRoomStore();
    const { providers } = useModelStore();

    const [step, setStep] = useState(1);
    const [localTopic, setLocalTopic] = useState("");
    const [localRole, setLocalRole] = useState<UserRole>("participant");

    // Host Config (if user is not host)
    const [hostProviderId, setHostProviderId] = useState("openai");
    const [hostModelId, setHostModelId] = useState("");
    const [hostTemperature, setHostTemperature] = useState(1.0);

    // Agent Form
    const [newAgentName, setNewAgentName] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("openai");
    const [selectedModel, setSelectedModel] = useState("");
    const [localTemperature, setLocalTemperature] = useState(1.0);

    // Helper to get models for a provider
    const getModelsFor = (pid: string) => providers.find(p => p.id === pid)?.models || [];

    const handleNextStep = () => {
        if (step === 1) {
            if (!localTopic.trim()) return;
            setTopic(localTopic);
            setUserRole(localRole);
            setStep(2);
        } else {
            // Start Debate
            if (agents.length < 1 && localRole !== 'observer') return; // Participant needs 1 agent? Actually observer needs 2 usually.

            // Auto-add AI Host if user is not host
            if (localRole !== 'host' && !agents.some(a => a.role === 'host')) {
                // Validation: Host Model must be selected
                if (!hostModelId) {
                    alert("Please select a model for the AI Host.");
                    return;
                }

                const hostAgent: IAgent = {
                    id: uuidv4(),
                    name: "Moderator",
                    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=Moderator`,
                    providerId: hostProviderId,
                    modelId: hostModelId,
                    systemPrompt: `You are the strict but fair moderator for a debate on the topic: "${localTopic}". Your goal is to guide the conversation, ensure all sides are heard, and keep the debate focused. Start by introducing the topic.`,
                    role: 'host',
                    temperature: hostTemperature,
                    color: "#ef4444"
                };
                addAgent(hostAgent);
            }

            // Immediately activate the debate so it starts automatically
            // This is critical for Observers who cannot pause/play
            setStatus('active');

            router.push("/arena");
        }
    };

    const handleAddAgent = () => {
        if (!newAgentName.trim()) return;
        if (!selectedModel) {
            alert("Please select a model for the agent.");
            return;
        }

        const newAgent: IAgent = {
            id: uuidv4(),
            name: newAgentName,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${newAgentName}`,
            providerId: selectedProvider,
            modelId: selectedModel,
            systemPrompt: systemPrompt || "You are a helpful assistant participating in a debate.",
            role: 'assistant',
            temperature: localTemperature,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        };

        addAgent(newAgent);
        setNewAgentName("");
        setSystemPrompt("");
        // Keep provider/model selection for convenience? Or reset?
        // Let's keep it.
    };

    // Filter only enabled providers (or those with models) for selection
    const activeProviders = useMemo(() => providers.filter(p => p.enabled || p.apiKey), [providers]);

    return (
        <div className="flex flex-col w-full max-w-6xl mx-auto p-4 sm:p-6 h-screen overflow-hidden text-zinc-800 dark:text-zinc-200">
            <header className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-lg"></div>
                    <h1 className="text-2xl font-bold tracking-tight">ChaosLM Setup</h1>
                </div>
                <button onClick={resetRoom} className="text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded transition-colors">Reset Room</button>
            </header>

            <div className="flex gap-6 flex-1 overflow-hidden">

                {/* Left Column: Configuration Wizard */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">

                    {/* Step 1: Context */}
                    <div className={`p-6 rounded-2xl border transition-all duration-300 ${step === 1 ? 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-lg' : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 opacity-50 grayscale'}`}>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-zinc-500'}`}>1</span>
                            Topic & Role
                        </h2>

                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">Debate Topic</label>
                                    <input
                                        className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-medium"
                                        placeholder="e.g. Is AI consciousness possible?"
                                        value={localTopic}
                                        onChange={(e) => setLocalTopic(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">Your Role</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <RoleButton
                                            active={localRole === 'host'}
                                            onClick={() => setLocalRole('host')}
                                            icon={<Settings className="w-5 h-5" />}
                                            title="Host"
                                            desc="Control the flow."
                                        />
                                        <RoleButton
                                            active={localRole === 'participant'}
                                            onClick={() => setLocalRole('participant')}
                                            icon={<User className="w-5 h-5" />}
                                            title="Participant"
                                            desc="Join the debate."
                                        />
                                        <RoleButton
                                            active={localRole === 'observer'}
                                            onClick={() => setLocalRole('observer')}
                                            icon={<Tv className="w-5 h-5" />}
                                            title="Observer"
                                            desc="Just watch."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleNextStep}
                                        disabled={!localTopic.trim()}
                                        className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                                    >
                                        Next Step <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Agents & Host */}
                    <div className={`p-6 rounded-2xl border transition-all duration-300 ${step === 2 ? 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-lg' : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 opacity-50 grayscale'}`}>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-zinc-500'}`}>2</span>
                            Participants
                        </h2>

                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">

                                {/* AI Host Config (Only if user is not host) */}
                                {localRole !== 'host' && (
                                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800/30">
                                        <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                                            <Bot className="w-4 h-4" /> AI Host Configuration
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-black/50 text-sm outline-none focus:border-amber-500"
                                                value={hostProviderId}
                                                onChange={(e) => {
                                                    setHostProviderId(e.target.value);
                                                    setHostModelId(""); // Reset model when provider changes
                                                }}
                                            >
                                                {activeProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <select
                                                className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-black/50 text-sm outline-none focus:border-amber-500"
                                                value={hostModelId}
                                                onChange={(e) => setHostModelId(e.target.value)}
                                            >
                                                <option value="" disabled>Select Host Model</option>
                                                {getModelsFor(hostProviderId).map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-xs font-medium text-amber-800 dark:text-amber-400">Temperature</label>
                                                <span className="text-xs font-mono text-amber-600">{hostTemperature.toFixed(1)}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="2" step="0.1"
                                                className="w-full h-1.5 bg-amber-200 dark:bg-amber-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                                                value={hostTemperature}
                                                onChange={(e) => setHostTemperature(parseFloat(e.target.value))}
                                            />
                                        </div>

                                        {getModelsFor(hostProviderId).length === 0 && (
                                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> No models found. Check API Key in sidebar.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Add Agent Form */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm">Add Debator Agent</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm"
                                                placeholder="Name (e.g. Socrates)"
                                                value={newAgentName}
                                                onChange={(e) => setNewAgentName(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                className="w-1/3 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm"
                                                value={selectedProvider}
                                                onChange={(e) => {
                                                    setSelectedProvider(e.target.value);
                                                    setSelectedModel("");
                                                }}
                                            >
                                                {activeProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <select
                                                className="flex-1 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm"
                                                value={selectedModel}
                                                onChange={(e) => setSelectedModel(e.target.value)}
                                            >
                                                <option value="" disabled>Select Model</option>
                                                {getModelsFor(selectedProvider).map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <textarea
                                        className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 min-h-[80px] text-sm resize-none"
                                        placeholder="System Prompt / Persona Description..."
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                    />

                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-semibold text-zinc-500">Model Temperature</label>
                                            <span className="text-xs font-mono font-bold text-blue-500">{localTemperature.toFixed(1)}</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="2" step="0.1"
                                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            value={localTemperature}
                                            onChange={(e) => setLocalTemperature(parseFloat(e.target.value))}
                                        />
                                        <p className="text-[10px] text-zinc-400 mt-1.5">Lower = focused & deterministic. Higher = creative & random.</p>
                                    </div>

                                    <button
                                        onClick={handleAddAgent}
                                        disabled={!newAgentName.trim() || !selectedModel}
                                        className="w-full py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" /> Add Agent
                                    </button>
                                </div>

                                {/* Agent List */}
                                <div className="space-y-2">
                                    {agents.map((agent) => (
                                        <div key={agent.id} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm relative group">
                                            <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full bg-zinc-100 border" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{agent.name}</span>
                                                    <span className="text-[10px] uppercase tracking-wider bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-500">{agent.role}</span>
                                                </div>
                                                <p className="text-xs text-zinc-500 truncate">{agent.modelId} ({agent.providerId})</p>
                                            </div>
                                            <button onClick={() => removeAgent(agent.id)} className="absolute right-3 top-3 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                                    <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800">Back</button>
                                    <button
                                        onClick={handleNextStep}
                                        disabled={
                                            (localRole !== 'host' && !hostModelId) || // Must have host model
                                            (agents.length === 0 && localRole !== 'observer') // Must have agents if participating (debate needs 2 sides usually, if 1 human + 1 bot)
                                        }
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                                    >
                                        Start Debate
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column: Model Manager */}
                <div className="w-96 min-w-[320px] flex flex-col gap-4">
                    <ModelManager />
                </div>

            </div >
        </div >
    );
}

function RoleButton({ active, onClick, icon, title, desc }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all duration-200 ${active
                ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-800 ring-1 ring-black dark:ring-white scale-[1.02] shadow-md'
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300'
                }`}
        >
            <div className={`${active ? 'text-black dark:text-white' : 'text-zinc-400'}`}>{icon}</div>
            <div>
                <div className={`font-bold text-sm ${active ? 'text-black dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>{title}</div>
                <div className="text-xs text-zinc-500">{desc}</div>
            </div>
        </button>
    )
}
