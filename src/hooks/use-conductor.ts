import { useRef, useEffect, useState } from "react";
import { useRoomStore } from "./use-room-store";
import { useModelStore } from "./use-model-store";
import { IMessage, IRoomState } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { getSchedule, ScheduleResult, getUpcomingSpeakers } from "@/lib/conductor/scheduler";
import {
    generateBootstrapContext,
    generateSystemBootstrapPrompt,
    generateChaosLMOpeningPrompt,
    generateAIHostOpeningPrompt
} from "@/lib/debate-rules";

export function useConductor() {
    const {
        status,
        currentTurn,
        agents,
        history,
        addMessage,
        updateMessage,
        setTurn,
        setStatus,
        setBootstrapContext,
        userRole,
        // Mode & Round State
        debateMode,
        currentStage,
        currentRound,
        setCurrentStage,
        setCurrentRound,
        isEnding,
        setIsEnding,
        bootstrapContext
    } = useRoomStore();

    const isProcessing = useRef(false);
    const abortController = useRef<AbortController | null>(null);
    const runTurnRef = useRef<((agentId?: string, overridePrompt?: string) => Promise<void>) | null>(null);
    const retryCount = useRef(0);
    const lastSystemInstruction = useRef("");

    // Track generating state for UI
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);

    // Stop Function
    const stop = () => {
        if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
        }
        isProcessing.current = false;
        setIsGenerating(false);
    };

    // PHASE 1: Bootstrap - ChaosLM (Director) generates preparation materials
    // This runs "behind the scenes" without adding to chat history
    const runBootstrapPhase = async (state: ReturnType<typeof useRoomStore.getState>) => {
        const moderator = state.agents.find(a => a.role === 'host');
        if (!moderator) {
            // No moderator, skip bootstrap
            setBootstrapContext('');
            advanceTurn();
            return;
        }

        isProcessing.current = true;
        setIsGenerating(true);
        abortController.current = new AbortController();

        try {
            const language = state.topic.match(/[\u4e00-\u9fa5]/) ? 'zh' : 'en';
            const bootstrapPrompt = generateSystemBootstrapPrompt(state, language as 'en' | 'zh');

            const providerConfig = useModelStore.getState().getProviderConfig(moderator.providerId);

            const payload = {
                providerId: moderator.providerId,
                modelId: moderator.modelId,
                apiKey: providerConfig?.apiKey || "",
                baseURL: providerConfig?.baseURL,
                systemPrompt: bootstrapPrompt,
                temperature: moderator.temperature,
                messages: [] // No history needed for bootstrap
            };

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: abortController.current.signal
            });

            if (!response.ok) throw new Error(`API ${response.status}: ${await response.text()}`);
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let contentAccumulator = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.trim().startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.trim().slice(6));
                            const chunkContent = data.content || "";
                            if (!data.isThinking && chunkContent) {
                                contentAccumulator += chunkContent;
                            }
                        } catch (e) { }
                    }
                }
            }

            // Store bootstrap context in state (NOT in chat history)
            setBootstrapContext(contentAccumulator);

        } catch (error: any) {
            console.error("Bootstrap generation failed:", error);
            // Even if bootstrap fails, continue with empty context
            setBootstrapContext('');
        } finally {
            isProcessing.current = false;
            setIsGenerating(false);
            // Continue to next phase (opening)
            advanceTurn();
        }
    };

    // Helper: Run an agent's turn
    const runTurn = async (agentId?: string, overridePrompt?: string) => {
        const state = useRoomStore.getState();
        const targetId = agentId || state.currentTurn;
        if (!targetId || isProcessing.current) return;

        // Get current schedule to understand what phase we're in
        const schedule = getSchedule(state);

        // PHASE 1: BOOTSTRAP - ChaosLM (Director) generates preparation materials
        // This is done "behind the scenes" - not shown in chat
        if (targetId === 'system' && schedule.isSystemBootstrap && schedule.phase === 'bootstrap') {
            await runBootstrapPhase(state);
            return;
        }

        // PHASE 2: OPENING - ChaosLM does opening if user is host, or AI Moderator does opening
        let currentAgent = state.agents.find((a) => a.id === targetId);
        let systemPromptOverride: string | null = null;

        if (targetId === 'system' && schedule.phase === 'opening') {
            // ChaosLM does brief opening then hands over to user moderator
            const moderator = state.agents.find(a => a.role === 'host');
            const language = state.topic.match(/[\u4e00-\u9fa5]/) ? 'zh' : 'en';

            if (moderator) {
                systemPromptOverride = generateChaosLMOpeningPrompt(state, state.bootstrapContext || '', language as 'en' | 'zh');
                currentAgent = {
                    ...moderator,
                    id: 'system',
                    name: 'ChaosLM',
                    systemPrompt: systemPromptOverride,
                    role: 'host'
                };
            } else {
                advanceTurn();
                return;
            }
        }

        // Normal turn execution
        if (!currentAgent) return;

        isProcessing.current = true;
        setIsGenerating(true);
        setLastError(null);
        abortController.current = new AbortController();

        const messageId = uuidv4();
        addMessage({
            id: messageId,
            role: targetId === 'system' ? 'system' : "assistant",
            senderId: targetId,
            content: "",
            isThinking: true,
        });

        const startTime = performance.now();

        // Prepare context: filter non-system, apply deepseek strip, and map roles perspectively
        const historyContext = state.history
            .filter(m => m.senderId !== 'system' || m.content.startsWith('[SIGNAL]'))
            .map(m => {
                const sender = state.agents.find(a => a.id === m.senderId);
                const name = sender ? sender.name : (m.senderId === 'user' ? 'User' : (m.senderId === 'system' ? 'System' : 'Unknown'));

                let content = m.content;
                // DeepSeek Reasoner: MUST strip thinking content from history to avoid 400
                if (currentAgent!.modelId === "deepseek-reasoner") {
                    content = content.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, "").trim();
                }

                // ROLE MAPPING PERSPECTIVE:
                // Only the messages from 'targetId' are 'assistant'
                // Signals are 'system'
                // Everything else is 'user'
                let role: "user" | "assistant" | "system" = "user";
                if (m.senderId === 'system') role = "system";
                else if (m.senderId === targetId) role = "assistant";
                else role = "user";

                return { role, content: `[${name}]: ${content}` };
            });

        const providerConfig = useModelStore.getState().getProviderConfig(currentAgent.providerId);

        // Check if this is AI Moderator Opening Phase
        const isAIOpening = schedule.phase === 'opening' &&
            targetId !== 'system' &&
            currentAgent.role === 'host' &&
            state.history.filter(m => m.senderId === targetId).length === 0; // First time moderator speaks

        // For AI Moderator Opening, inject full bootstrap context
        let bootstrapContent = "";
        if (isAIOpening) {
            const language = state.topic.match(/[\u4e00-\u9fa5]/) ? 'zh' : 'en';
            const openingPrompt = generateAIHostOpeningPrompt(state, state.bootstrapContext || '', language as 'en' | 'zh');
            bootstrapContent = `\n[DEBATE BACKGROUND]\n${state.bootstrapContext || ''}\n\n[OPENING INSTRUCTION]\n${openingPrompt}\n`;

            // Override the system prompt for AI Moderator opening
            systemPromptOverride = openingPrompt;
        } else if (state.bootstrapContext) {
            // Normal case: just include brief context
            bootstrapContent = `\n[DEBATE BACKGROUND]\n${state.bootstrapContext}\n`;
        }

        const finalSystemPrompt = systemPromptOverride || currentAgent.systemPrompt;

        // FIX ISSUE #5 (Prompt Leaking):
        // If overridePrompt looks like an internal system instruction (starts with [), do NOT include it in [CURRENT TASK]
        // This prevents the model from regurgitating "[OPENING_AI_HOST]: You are..."
        const safeOverridePrompt = (overridePrompt && overridePrompt.startsWith('['))
            ? "Execute your role according to your specific system instructions."
            : (overridePrompt || "Continue the discussion naturally.");

        // FIX ISSUE #4 (Explicit Schedule Context):
        // Inject upcoming speakers context so models know who is next
        const upcomingSpeakers = getUpcomingSpeakers(state, 3);
        const upcomingNames = upcomingSpeakers.map(id => {
            const ag = state.agents.find(a => a.id === id);
            return ag?.name || (id === 'user' ? 'User' : 'Unknown');
        }).join(' -> ');

        const scheduleContext = upcomingNames
            ? `[UPCOMING SPEAKERS]: ${upcomingNames} -> ... (Please be concise if others are waiting)`
            : ``;

        const enhancedSystemPrompt = `
[DEBATE CONTEXT]
Topic: "${state.topic || "General Discussion"}"
${bootstrapContent}
Mode: ${state.debateMode}
Current Phase: ${state.currentStage}
Round: ${state.currentRound}
${scheduleContext}

[IDENTITY]
Your name is ${currentAgent.name}. Role: ${currentAgent.role}.
Always stay in character. If you are the Moderator, focus on facilitating according to System instructions.

[PERSONALITY]
${finalSystemPrompt}

[@MENTION MECHANISM]
You can use @MemberName to directly address specific participants (e.g., "@Alice I agree with your point...").
All participants will see highlighted mentions, and the mentioned member will notice it's directed at them.
Use this to ask questions, respond to arguments, or direct attention in multi-person discussions.

[CURRENT TASK]
${safeOverridePrompt}
`.trim();

        const payload = {
            providerId: currentAgent.providerId,
            modelId: currentAgent.modelId,
            apiKey: providerConfig?.apiKey || "",
            baseURL: providerConfig?.baseURL,
            systemPrompt: enhancedSystemPrompt,
            temperature: currentAgent.temperature,
            // CRITICAL FIX: For the very first turn (AI Opening), history is empty. 
            // We MUST provide a User Text triggering the generation, otherwise the model might just autocomplete the system prompt or repeat instructions.
            messages: isAIOpening
                ? [{ role: 'user', content: "(System Trigger) The discussion is live. Please deliver your opening speech now, strictly adhering to your persona and the provided context." }]
                : historyContext
        };

        let success = false;
        let thinkingAccumulator = "";
        let contentAccumulator = "";

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: abortController.current.signal
            });

            if (!response.ok) throw new Error(`API ${response.status}: ${await response.text()}`);
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.trim().startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.trim().slice(6));
                            const chunkContent = data.content || "";

                            if (data.isThinking) {
                                thinkingAccumulator += chunkContent;
                                updateMessage(messageId, `<think>${thinkingAccumulator}</think>\n` + contentAccumulator, true);
                            } else if (chunkContent || data.content === "") {
                                // data.content === "" is sometimes sent as an "end of block" signal
                                contentAccumulator += chunkContent;

                                // Sanitize: If output starts with internal tag, strip it
                                // e.g. "[INSTRUCTION]: You are..." -> "You are..."
                                let cleanContent = contentAccumulator;
                                if (cleanContent.startsWith('[')) {
                                    cleanContent = cleanContent.replace(/^\[[A-Z_]+\]:?\s*/, '');
                                }

                                updateMessage(messageId, (thinkingAccumulator ? `<think>${thinkingAccumulator}</think>\n` : "") + cleanContent, false);
                            }
                        } catch (e) { }
                    }
                }
            }

            const endTime = performance.now();
            const duration = endTime - startTime;
            const estimatedTokens = Math.ceil((thinkingAccumulator.length + contentAccumulator.length) / 4);

            let finalCleanContent = contentAccumulator;
            if (finalCleanContent.startsWith('[')) {
                finalCleanContent = finalCleanContent.replace(/^\[[A-Z_]+\]:?\s*/, '');
            }

            const finalContent = (thinkingAccumulator ? `<think>${thinkingAccumulator}</think>\n` : "") + finalCleanContent;

            // SCHEDULER HARDENING: Detection of "Stuck" agent
            // If content is empty (and it's not the initial bootstrap which might be slow but usually has content)
            // Or if it's just a repetition of thinking without content.
            if (targetId !== 'system' && !contentAccumulator.trim()) {
                throw new Error("Agent generated empty content. Possible API failure or model loop.");
            }

            updateMessage(messageId, finalContent, false, estimatedTokens, duration);

            success = true;
            retryCount.current = 0;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                updateMessage(messageId, (thinkingAccumulator ? `<think>${thinkingAccumulator}</think>\n` : "") + contentAccumulator + " [Stopped]", false);
            } else {
                console.error("Turn failed:", error);
                setLastError(error.message);
                if (retryCount.current < 2) {
                    retryCount.current++;
                    updateMessage(messageId, `[Error: Retrying ${retryCount.current}/3...]`, false);
                    setTimeout(() => runTurn(targetId, overridePrompt), 2000);
                    return;
                } else {
                    updateMessage(messageId, `[Critical Error: ${error.message}. Please check API settings or model limits.]`, false);
                    setStatus('paused');
                }
            }
            success = false;
        } finally {
            isProcessing.current = false;
            setIsGenerating(false);
            if (success) advanceTurn();
        }
    };

    // Helper: Logic to advance to the next state
    const advanceTurn = () => {
        const state = useRoomStore.getState();
        if (state.status !== 'active') return;

        const schedule = getSchedule(state);

        // Update room round/stage if scheduler suggests
        if (schedule.nextStage) setCurrentStage(schedule.nextStage);
        if (schedule.nextRound) setCurrentRound(schedule.nextRound);

        // Notify with System Signal (skip for bootstrap phase as it's done behind the scenes)
        // Also skip internal scheduling instructions (those starting with '[' like [OPENING_AI_HOST])
        const isInternalInstruction = schedule.instruction?.startsWith('[');
        if (schedule.instruction && schedule.instruction !== lastSystemInstruction.current && schedule.phase !== 'bootstrap' && !isInternalInstruction) {
            addMessage({
                role: 'system',
                senderId: 'system',
                content: schedule.instruction
            });
            lastSystemInstruction.current = schedule.instruction;
        }

        if (schedule.nextTurn) {
            setTimeout(() => setTurn(schedule.nextTurn), 800);
        } else {
            setStatus('completed');
        }
    };

    // Bootstrap Effect - Start the debate
    useEffect(() => {
        if (status === 'active' && !currentTurn && history.length === 0) {
            const startSchedule = getSchedule(useRoomStore.getState());

            // For bootstrap phase, we don't add a message to history (it's done behind the scenes)
            // Just set the turn to start the process
            if (startSchedule.phase === 'bootstrap') {
                setTurn(startSchedule.nextTurn);
            } else {
                // For other phases, add the system instruction
                addMessage({
                    role: 'system',
                    senderId: 'system',
                    content: startSchedule.instruction
                });
                lastSystemInstruction.current = startSchedule.instruction;
                setTurn(startSchedule.nextTurn);
            }
        }
    }, [status, currentTurn, history.length, addMessage, setTurn]);

    // Store last schedule instruction for overridePrompt
    const lastScheduleRef = useRef<ScheduleResult | null>(null);

    // Loop Effect
    useEffect(() => {
        const state = useRoomStore.getState();
        if (state.status !== 'active' || !state.currentTurn || isProcessing.current) return;
        if (state.currentTurn === 'user') return;

        // In Classic/Custom mode, if it's a Participant turn, Moderator often speaks first to facilitate.
        // But the scheduler decides who's next.
        // If the scheduler says Pro is next, the turn IS Pro.

        // Pass the schedule instruction as overridePrompt ONLY if it's NOT a standard discussion turn
        // For standard "Next speaker is..." instructions, we don't want to force them into the prompt
        // because it causes the model to repeat "Next speaker is..." instead of speaking.
        const schedule = getSchedule(state);
        lastScheduleRef.current = schedule;

        // FIX ISSUE #6 (Scheduler Skip):
        // If it's just a standard turn switch (discussion phase), DO NOT pass the instruction as override.
        // The agent already knows it's their turn because they are being called.
        // We only pass override if it's a specific system directive (like "Summarize now" or "Opening Speech").
        const isStandardTurnSwitch = schedule.phase === 'discussion' && schedule.instruction.includes("[SYSTEM]");
        const override = isStandardTurnSwitch ? undefined : schedule.instruction;

        runTurn(undefined, override);
    }, [currentTurn, status]);

    runTurnRef.current = runTurn;

    const regenerate = (agentId: string) => runTurnRef.current?.(agentId);

    const endDebate = () => {
        setIsEnding(true);
        stop();
        // Give it a tiny delay to ensure state propagates
        setTimeout(async () => {
            const state = useRoomStore.getState();
            const schedule = getSchedule(state);

            // Enhanced Summary Prompt
            const summaryInstruction = `[SYSTEM]: The debate on "${state.topic}" has reached its conclusion. 
Moderator, please provide a profound, elegant, and inspiring final summary. 
Synthesize the key arguments from all participants, highlight the core tensions explored, and offer a visionary perspective on where the discussion leaves us. 
Avoid a simple list; create a cohesive narrative that honors the depth of the shared exchange. 
After providing this summary, the discussion will be officially closed.`;

            addMessage({
                role: 'system',
                senderId: 'system',
                content: summaryInstruction
            });

            setTurn(schedule.nextTurn);
            setStatus('active');

            // Force run the final turn manually
            if (schedule.nextTurn && schedule.nextTurn !== 'user') {
                try {
                    await runTurn(schedule.nextTurn, summaryInstruction);
                } catch (err) {
                    console.error("End summary failed:", err);
                } finally {
                    // Mark as completed AFTER the moderator finishes (or fails)
                    // We must use setTimeout to ensure this happens after the state update from runTurn
                    setTimeout(() => {
                        useRoomStore.getState().setStatus('completed');
                        setTurn(null); // Ensure no more turns are active
                    }, 500);
                }
            } else {
                setStatus('completed');
                setTurn(null);
            }
        }, 100);
    };

    const restartTurn = () => {
        retryCount.current = 0;
        setStatus('active');
        runTurn();
    };

    return { stop, isGenerating, regenerate, endDebate, lastError, restartTurn };
}
