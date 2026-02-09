import { IRoomState, IAgent, ClassicStage } from "@/types";

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

    // 0. Manual Termination
    if (isEnding) {
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

        if (!currentTurn || currentTurn === moderator?.id) {
            return { nextTurn: roster[0], instruction: `[SYSTEM]: Opening floor. ${roster[0]} is speaking next.` };
        }

        const currentIndex = roster.indexOf(currentTurn);
        const nextIndex = (currentIndex + 1) % roster.length;
        const nextId = roster[nextIndex];

        return { nextTurn: nextId, instruction: `[SYSTEM]: Next speaker: ${nextId}.` };
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
            return {
                nextTurn: roster[0],
                instruction: `[SYSTEM]: Round ${currentRound + 1} starts. ${roster[0]} is up.`,
                nextRound: currentRound + 1
            };
        }

        return { nextTurn: roster[currentIndex + 1], instruction: `[SYSTEM]: Round ${currentRound}: next is ${roster[currentIndex + 1]}.` };
    }

    // 3. Classic Mode: Stage Driven
    // Stages: introduction -> pro_opening -> con_opening -> pro_rebuttal -> con_rebuttal -> free -> pro_summary -> con_summary -> conclusion
    const pro = participants[0];
    const con = participants[1] || pro; // Fallback if only 1 agent

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
        instruction: `[SYSTEM]: Phase [${stageLabels[nextStage]}]. Next turn: ${targetId || 'Moderator'}.`,
        nextStage: nextStage
    };
}
