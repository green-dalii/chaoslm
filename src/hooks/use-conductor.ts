import { useRef, useEffect, useState } from "react";
import { useRoomStore } from "./use-room-store";
import { useModelStore } from "./use-model-store";
import { IMessage } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { getNextTurn } from "@/lib/conductor/scheduler";

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
        userRole
    } = useRoomStore();

    const isProcessing = useRef(false);
    const hasBootstrapped = useRef(false);
    const abortController = useRef<AbortController | null>(null);
    const runTurnRef = useRef<((agentId?: string) => Promise<void>) | null>(null);

    // Track generating state for UI
    const [isGenerating, setIsGenerating] = useState(false);

    // Stop Function
    const stop = () => {
        if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
            isProcessing.current = false;
            setIsGenerating(false);
        }
    };

    // Bootstrap Effect: Start the conversation
    useEffect(() => {
        if (status === 'active' && !currentTurn && history.length === 0 && !hasBootstrapped.current) {
            hasBootstrapped.current = true;

            // Inject a system prompt to jumpstart the context for LLMs
            const state = useRoomStore.getState();
            const topic = state.topic || "General Discussion";

            // Build participant list string
            // We want to give the AI Host context about who is in the room.
            const participantInfo = state.agents
                .filter(a => a.role !== 'host') // Don't list the host themselves if we don't want to
                .map(a => `- ${a.name} (${a.role})`)
                .join("\n");

            let promptContent = `SYSTEM: The debate is now live. Topic: "${topic}".`;
            if (participantInfo) {
                promptContent += `\n\nParticipants:\n${participantInfo}`;
            }
            promptContent += `\n\nModerator, please introduce the topic, introduce the participants (and their expected stances based on their roles), and then begin the session by inviting the first speaker.`;

            addMessage({
                role: 'system',
                senderId: 'system',
                content: promptContent
            });

            // Determine who starts
            if (userRole === 'host') {
                setTurn('user');
            } else {
                const hostAgent = agents.find(a => a.role === 'host') || agents[0];
                if (hostAgent) {
                    setTimeout(() => {
                        setTurn(hostAgent.id);
                    }, 500);
                }
            }
        }
    }, [status, currentTurn, history.length, userRole, agents, setTurn, addMessage]);

    // Main Turn Loop
    useEffect(() => {
        // We only want to trigger this when `currentTurn` changes (or status becomes active).
        // We DO NOT want to trigger on history updates.

        const state = useRoomStore.getState();
        if (state.status !== 'active' || !state.currentTurn || isProcessing.current) return;

        // If it's user's turn, do nothing (wait for input)
        if (state.currentTurn === 'user') return;

        const currentAgent = state.agents.find((a) => a.id === state.currentTurn);
        if (!currentAgent) {
            return;
        }

        const runTurn = async (agentId?: string) => {
            const state = useRoomStore.getState();
            const targetId = agentId || state.currentTurn;
            if (!targetId || isProcessing.current) return;

            const currentAgent = state.agents.find((a) => a.id === targetId);
            if (!currentAgent) return;

            isProcessing.current = true;
            setIsGenerating(true);
            abortController.current = new AbortController();

            const messageId = uuidv4();
            addMessage({
                id: messageId,
                role: "assistant",
                senderId: currentAgent.id,
                content: "",
                isThinking: true,
            });

            // Prepare history from FRESH state
            // ENHANCE: Prefix content with sender name [Name]: content
            const historyContext = state.history
                .filter(m => m.senderId !== 'system')
                .map(m => {
                    const sender = state.agents.find(a => a.id === m.senderId);
                    const name = sender ? sender.name : (m.senderId === 'user' ? 'User' : 'Unknown');

                    let content = m.content;
                    // DeepSeek Reasoner guidance: ignore reasoning_content from history
                    if (currentAgent.modelId === "deepseek-reasoner") {
                        content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
                    }

                    return {
                        role,
                        content: `[${name}]: ${content}`
                    };
                });

            // Get provider config
            const providerConfig = useModelStore.getState().getProviderConfig(currentAgent.providerId);

            // ENHANCE SYSTEM PROMPT
            const topic = state.topic || "General Discussion";
            const participantsList = state.agents
                .map(a => `- ${a.name} (${a.role}${a.id === currentAgent.id ? ' - THIS IS YOU' : ''})`)
                .join("\n");

            const hostAgent = state.agents.find(a => a.role === 'host');
            let moderatorContext = "";
            if (hostAgent) {
                const hostMsgs = state.history.filter(m => m.senderId === hostAgent.id);
                if (hostMsgs.length > 0) {
                    moderatorContext = `\nModerator's Opening/Context: "${hostMsgs[0].content}"`;
                }
            }

            const enhancedSystemPrompt = `
[DEBATE CONTEXT]
Topic: "${topic}"
Participants:
${participantsList}
${moderatorContext}

[IDENTITY]
Your name is ${currentAgent.name}. You are the ${currentAgent.role}.
Always stay in character. Reference others by name if possible.

[PERSONALITY & STANCE]
${currentAgent.systemPrompt}
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

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`API failed: ${response.status} - ${errText}`);
                }

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
                                const jsonStr = line.trim().slice(6);
                                if (jsonStr === "[DONE]") continue;
                                const data = JSON.parse(jsonStr);

                                if (data.isThinking && data.content) {
                                    thinkingAccumulator += data.content;
                                    const fullText = `<think>${thinkingAccumulator}</think>\n` + contentAccumulator;
                                    updateMessage(messageId, fullText, true); // Keep thinking
                                } else if (data.content) {
                                    contentAccumulator += data.content;
                                    const fullText = (thinkingAccumulator ? `<think>${thinkingAccumulator}</think>\n` : "") + contentAccumulator;
                                    updateMessage(messageId, fullText, false); // CLEAR thinking flag
                                }
                            } catch (e) { }
                        }
                    }
                }

                success = true;

            } catch (error: any) {
                if (error.name === 'AbortError') {
                    console.log("Stopped.");
                    updateMessage(messageId, (thinkingAccumulator ? `<think>${thinkingAccumulator}</think>\n` : "") + contentAccumulator + " [Stopped]", false);
                    success = false; // Strictly speaking, not a full success
                } else {
                    console.error("Turn failed:", error);
                    updateMessage(messageId, `Error occurred: ${error.message}`, false);
                    setStatus('paused');
                    success = false;
                }
            } finally {
                isProcessing.current = false;
                setIsGenerating(false);
                abortController.current = null;

                // STRICT: ONLY advance turn if successful
                if (success) {
                    const endState = useRoomStore.getState();
                    if (endState.status === 'active') {
                        setTimeout(() => {
                            const nextId = getNextTurn(endState);
                            setTurn(nextId);
                        }, 500);
                    }
                }
            }
        };
        runTurnRef.current = runTurn; // Store the latest runTurn function in the ref

        runTurn();

    }, [currentTurn, status, addMessage, updateMessage, setStatus, setTurn, getNextTurn]);

    const regenerate = (agentId: string) => {
        // To regenerate, we usually want to clear the last message or just add a new one?
        // Let's just trigger runTurn for that agent.
        // Note: For a true ChatGPT experience, we might want to delete the old message.
        // For now, let's just trigger a new turn.
        if (runTurnRef.current) {
            runTurnRef.current(agentId);
        }
    };

    return { stop, isGenerating, regenerate };
}
