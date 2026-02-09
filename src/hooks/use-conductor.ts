import { useRef, useEffect, useState } from "react";
import { useRoomStore } from "./use-room-store";
import { useModelStore } from "./use-model-store";
import { IMessage, IRoomState } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { getSchedule, ScheduleResult } from "@/lib/conductor/scheduler";

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
        userRole,
        // Mode & Round State
        debateMode,
        currentStage,
        currentRound,
        setCurrentStage,
        setCurrentRound,
        isEnding,
        setIsEnding
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

    // Helper: Run an agent's turn
    const runTurn = async (agentId?: string, overridePrompt?: string) => {
        const state = useRoomStore.getState();
        const targetId = agentId || state.currentTurn;
        if (!targetId || isProcessing.current) return;

        const currentAgent = state.agents.find((a) => a.id === targetId);
        if (!currentAgent) return;

        isProcessing.current = true;
        setIsGenerating(true);
        setLastError(null);
        abortController.current = new AbortController();

        const messageId = uuidv4();
        addMessage({
            id: messageId,
            role: "assistant",
            senderId: currentAgent.id,
            content: "",
            isThinking: true,
        });

        // Prepare context: filter non-system, apply deepseek strip
        const historyContext = state.history
            .filter(m => m.senderId !== 'system' || m.content.startsWith('[SIGNAL]')) // Keep signals?
            .map(m => {
                const sender = state.agents.find(a => a.id === m.senderId);
                const name = sender ? sender.name : (m.senderId === 'user' ? 'User' : (m.senderId === 'system' ? 'System' : 'Unknown'));

                let content = m.content;
                if (currentAgent.modelId === "deepseek-reasoner") {
                    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
                }

                let role: "user" | "assistant" | "system" = "assistant";
                if (m.senderId === 'user') role = "user";
                else if (m.senderId === 'system') role = "system";

                return { role, content: `[${name}]: ${content}` };
            });

        const providerConfig = useModelStore.getState().getProviderConfig(currentAgent.providerId);
        const enhancedSystemPrompt = `
[DEBATE CONTEXT]
Topic: "${state.topic || "General Discussion"}"
Mode: ${state.debateMode}
Current Phase: ${state.currentStage}
Round: ${state.currentRound}

[IDENTITY]
Your name is ${currentAgent.name}. Role: ${currentAgent.role}.
Always stay in character. If you are the Moderator, focus on facilitating according to System instructions.

[PERSONALITY]
${currentAgent.systemPrompt}

[CURRENT TASK]
${overridePrompt || "Continue the debate naturally based on history."}
`.trim();

        const payload = {
            providerId: currentAgent.providerId,
            modelId: currentAgent.modelId,
            apiKey: providerConfig?.apiKey || "",
            baseURL: providerConfig?.baseURL,
            systemPrompt: enhancedSystemPrompt,
            temperature: currentAgent.temperature,
            messages: historyContext
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
                            if (data.isThinking && data.content) {
                                thinkingAccumulator += data.content;
                                updateMessage(messageId, `<think>${thinkingAccumulator}</think>\n` + contentAccumulator, true);
                            } else if (data.content) {
                                contentAccumulator += data.content;
                                updateMessage(messageId, (thinkingAccumulator ? `<think>${thinkingAccumulator}</think>\n` : "") + contentAccumulator, false);
                            }
                        } catch (e) { }
                    }
                }
            }
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

        // Notify with System Signal
        if (schedule.instruction && schedule.instruction !== lastSystemInstruction.current) {
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

    // Bootstrap Effect
    useEffect(() => {
        if (status === 'active' && !currentTurn && history.length === 0) {
            const startSchedule = getSchedule(useRoomStore.getState());
            addMessage({
                role: 'system',
                senderId: 'system',
                content: startSchedule.instruction
            });
            lastSystemInstruction.current = startSchedule.instruction;
            setTurn(startSchedule.nextTurn);
        }
    }, [status, currentTurn, history.length, addMessage, setTurn]);

    // Loop Effect
    useEffect(() => {
        const state = useRoomStore.getState();
        if (state.status !== 'active' || !state.currentTurn || isProcessing.current) return;
        if (state.currentTurn === 'user') return;

        // In Classic/Custom mode, if it's a Participant turn, Moderator often speaks first to facilitate.
        // But the scheduler decides who's next. 
        // If the scheduler says Pro is next, the turn IS Pro.

        runTurn();
    }, [currentTurn, status]);

    runTurnRef.current = runTurn;

    const regenerate = (agentId: string) => runTurnRef.current?.(agentId);

    const endDebate = () => {
        setIsEnding(true);
        stop();
        // Give it a tiny delay to ensure state propagates
        setTimeout(() => {
            const state = useRoomStore.getState();
            const schedule = getSchedule(state);
            addMessage({
                role: 'system',
                senderId: 'system',
                content: schedule.instruction
            });
            setTurn(schedule.nextTurn);
            setStatus('active');
        }, 100);
    };

    const restartTurn = () => {
        retryCount.current = 0;
        setStatus('active');
        runTurn();
    };

    return { stop, isGenerating, regenerate, endDebate, lastError, restartTurn };
}
