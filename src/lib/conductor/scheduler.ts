import { IRoomState, IAgent, ClassicStage, Role } from "@/types";
import { v4 as uuidv4 } from "uuid";

export interface ScheduleResult {
    nextTurn: string | null;
    instruction: string;
    nextStage?: ClassicStage;
    nextRound?: number;
}

export function getSchedule(state: IRoomState): ScheduleResult {
    const { agents, currentTurn, status, debateMode, currentStage, currentRound, maxRounds, isEnding } = state;
    const moderator = agents.find(a => a.role === 'host');
    const participants = agents.filter(a => a.role !== 'host');

    // 0. Start of Debate: Always System Bootstrap
    if (state.history.length === 0 || (!currentTurn && status === 'idle')) {
        return {
            nextTurn: 'system', // Conductor will handle generating background
            instruction: `[SYSTEM]: Initiating debate bootstrap for topic: "${state.topic}". System, please generate a comprehensive debate context and background rules.`,
            nextStage: 'introduction' // We use intro as the target after bootstrap
        };
    }

    // 0.1 Manual Termination
    if (isEnding) {
        if (currentTurn === moderator?.id && state.history.some(m => m.senderId === moderator.id && !m.isThinking)) {
            return {
                nextTurn: null,
                instruction: "[SYSTEM]: Debate concluded after manual termination."
            };
        }
        return {
            nextTurn: moderator?.id || 'user',
            instruction: "[SYSTEM]: The debate has been manually ended. Moderator, please provide a final concluding summary."
        };
    }

    if (participants.length === 0) {
        return { nextTurn: null, instruction: "No participants available." };
    }

    // 1. Standard Mode: Simple Loop
    if (debateMode === 'standard') {
        const roster = participants.map(p => p.id);
        if (state.userRole !== 'observer') roster.push('user');

        // Transition from System Bootstrap -> Moderator Intro
        const lastMessage = state.history[state.history.length - 1];
        if (lastMessage?.senderId === 'system' && !lastMessage.content.startsWith('[')) {
            // After system bootstrap context is generated, moderator must introduce
            return {
                nextTurn: moderator?.id || roster[0],
                instruction: `[SYSTEM]: Context generated. Moderator, please introduce the topic and welcome the participants.`
            };
        }

        // If current turn is moderator and we just started, first participant is next
        if (!currentTurn || currentTurn === moderator?.id) {
            const nextId = roster[0];
            const firstName = agents.find(a => a.id === nextId)?.name || nextId;
            return { nextTurn: nextId, instruction: `[SYSTEM]: Opening floor. ${firstName} is speaking next.` };
        }

        const currentIndex = roster.indexOf(currentTurn);
        if (currentIndex === -1) {
            // Fallback for weird edge cases
            return { nextTurn: roster[0], instruction: `[SYSTEM]: Resuming discussion. ${agents.find(a => a.id === roster[0])?.name} is up.` };
        }

        const nextIndex = (currentIndex + 1) % roster.length;
        const nextId = roster[nextIndex];
        const nextName = agents.find(a => a.id === nextId)?.name || nextId;

        return { nextTurn: nextId, instruction: `[SYSTEM]: Next speaker: ${nextName}.` };
    }

    // 2. Custom Mode: Round Limited
    if (debateMode === 'custom') {
        const roster = participants.map(p => p.id);
        if (!currentTurn || currentTurn === moderator?.id) {
            return { nextTurn: roster[0], instruction: `[SYSTEM]: Round ${currentRound} starts. ${roster[0]} is up.`, nextRound: currentRound };
        }

        const currentIndex = roster.indexOf(currentTurn);
        if (currentIndex === roster.length - 1) {
            // End of round
            if (currentRound >= maxRounds) {
                return {
                    nextTurn: moderator?.id || null,
                    instruction: `[SYSTEM]: Max rounds reached. Moderator, please summarize and conclude.`,
                };
            }
            const nextName = agents.find(a => a.id === roster[0])?.name || roster[0];
            return {
                nextTurn: roster[0],
                instruction: `[SYSTEM]: Round ${currentRound + 1} starts. ${nextName} is up.`,
                nextRound: currentRound + 1
            };
        }

        const nextId = roster[currentIndex + 1];
        const nextName = agents.find(a => a.id === nextId)?.name || nextId;
        return { nextTurn: nextId, instruction: `[SYSTEM]: Round ${currentRound}: next is ${nextName}.` };
    }

    // 3. Classic Mode: Stage Driven
    // Stages: introduction -> pro_opening -> con_opening -> pro_rebuttal -> con_rebuttal -> free -> pro_summary -> con_summary -> conclusion
    const pro = agents.find(a => a.stance === 'pro') || participants[0];
    const con = agents.find(a => a.stance === 'con') || participants[1] || pro;

    const stageSequence: ClassicStage[] = [
        'introduction', 'pro_opening', 'con_opening', 'pro_rebuttal',
        'con_rebuttal', 'free', 'pro_summary', 'con_summary', 'conclusion'
    ];

    const currentIdx = stageSequence.indexOf(currentStage);

    // If turn is finished, move to next stage? 
    // Usually, each stage has 1 speaker, except 'free' which might have rounds?
    // Let's simplify: 1 turn per stage.

    const nextStage = currentIdx < stageSequence.length - 1 ? stageSequence[currentIdx + 1] : null;

    if (!nextStage) return { nextTurn: null, instruction: "[SYSTEM]: Debate concluded." };

    const getTargetForStage = (stage: ClassicStage) => {
        switch (stage) {
            case 'introduction': return moderator?.id || 'host';
            case 'pro_opening': return pro.id;
            case 'con_opening': return con.id;
            case 'pro_rebuttal': return pro.id;
            case 'con_rebuttal': return con.id;
            case 'free': return moderator?.id || 'host'; // Moderator facilitates free debate
            case 'pro_summary': return pro.id;
            case 'con_summary': return con.id;
            case 'conclusion': return moderator?.id || 'host';
            default: return null;
        }
    };

    const targetId = getTargetForStage(nextStage);
    const targetName = agents.find(a => a.id === targetId)?.name || (targetId === 'host' ? 'Moderator' : 'Unknown');

    const stageLabels: Record<ClassicStage, string> = {
        introduction: "Opening and Introduction",
        pro_opening: "Pro Affirmative Opening Statement",
        con_opening: "Con Opposition Opening Statement",
        pro_rebuttal: "Pro Rebuttal",
        con_rebuttal: "Con Rebuttal",
        free: "Free Debate Session",
        pro_summary: "Pro Closing Summary",
        con_summary: "Con Closing Summary",
        conclusion: "Final Conclusion by Moderator"
    };

    return {
        nextTurn: targetId,
        instruction: `[SYSTEM]: Phase [${stageLabels[nextStage]}]. Next turn: ${targetName}.`,
        nextStage: nextStage
    };
}
