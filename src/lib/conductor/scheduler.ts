import { IRoomState, ClassicStage } from "@/types";

export interface ScheduleResult {
    nextTurn: string | null;
    instruction: string;
    nextStage?: ClassicStage;
    nextRound?: number;
    phase?: 'bootstrap' | 'opening' | 'discussion' | 'conclusion';
    isSystemBootstrap?: boolean; // True if this is ChaosLM generating bootstrap context (not shown in chat)
}

/**
 * ChaosLM acts as the "Director" behind the scenes.
 *
 * Phase 1 - Bootstrap: ChaosLM generates preparation materials (stored in state, not shown to users)
 * Phase 2 - Opening: The Moderator (AI or User) delivers the opening speech
 * Phase 3 - Discussion: Normal debate flow
 */

export function getSchedule(state: IRoomState): ScheduleResult {
    const { agents, currentTurn, status, debateMode, currentStage, currentRound, maxRounds, isEnding, userRole, history, bootstrapContext } = state;
    const moderator = agents.find(a => a.role === 'host');
    const participants = agents.filter(a => a.role !== 'host');

    // 0. Manual Termination
    if (isEnding) {
        if (currentTurn === moderator?.id && history.some(m => m.senderId === moderator.id && !m.isThinking)) {
            return {
                nextTurn: null,
                instruction: "[SYSTEM]: Debate concluded after manual termination.",
                phase: 'conclusion'
            };
        }
        return {
            nextTurn: moderator?.id || 'user',
            instruction: "[SYSTEM]: The debate has been manually ended. Moderator, please provide a final concluding summary.",
            phase: 'conclusion'
        };
    }

    if (participants.length === 0) {
        return { nextTurn: null, instruction: "No participants available.", phase: 'discussion' };
    }

    // PHASE 1: BOOTSTRAP - ChaosLM (Director) generates preparation materials
    // This is done "behind the scenes" - not shown in chat, stored in state.bootstrapContext
    if (!bootstrapContext && status === 'active' && history.length === 0) {
        return {
            nextTurn: 'system',
            instruction: `[BOOTSTRAP_GENERATE]: Generate preparation materials for topic: "${state.topic}". Mode: ${debateMode}. Store the result in bootstrapContext - DO NOT output to chat.`,
            nextStage: 'introduction',
            phase: 'bootstrap',
            isSystemBootstrap: true
        };
    }

    // PHASE 2: OPENING - Moderator delivers opening speech
    // After bootstrap is ready, the moderator does the opening
    const hasOpeningStarted = history.some(m =>
        m.senderId === moderator?.id ||
        (m.senderId === 'system' && m.content.includes('[OPENING_DONE]'))
    );

    if (bootstrapContext && !hasOpeningStarted && history.length === 0) {
        // Case A: User is the host -> ChaosLM does brief intro, then user takes over
        if (userRole === 'host') {
            return {
                nextTurn: 'system',
                instruction: `[OPENING_USER_HOST]: You are ChaosLM. Deliver a brief welcome (2-3 sentences) introducing the topic, then hand over to the user moderator to take charge. The full context is: ${bootstrapContext.substring(0, 500)}...`,
                phase: 'opening',
                isSystemBootstrap: false
            };
        }
        // Case B: AI is the host -> AI Moderator does full opening
        else if (moderator) {
            return {
                nextTurn: moderator.id,
                instruction: `[OPENING_AI_HOST]: You are the AI Moderator. Deliver a comprehensive opening speech: welcome participants, introduce the topic background, explain the rules, introduce each participant and their stance, and set the stage for the discussion. Use this context: ${bootstrapContext}`,
                phase: 'opening'
            };
        }
        // Case C: No moderator -> First participant starts
        else {
            const firstParticipant = participants[0];
            return {
                nextTurn: firstParticipant?.id || null,
                instruction: `[OPENING_NO_MOD]: No moderator assigned. ${firstParticipant?.name || 'First participant'}, please begin the discussion.`,
                phase: 'opening'
            };
        }
    }

    // PHASE 3: DISCUSSION - Normal debate flow
    return getDiscussionSchedule(state);
}

function getDiscussionSchedule(state: IRoomState): ScheduleResult {
    const { debateMode, currentTurn, currentStage, currentRound, maxRounds, agents, userRole, history } = state;
    const moderator = agents.find(a => a.role === 'host');
    const participants = agents.filter(a => a.role !== 'host');

    // 1. Standard Mode: Simple Loop
    if (debateMode === 'standard') {
        const roster = participants.map(p => p.id);
        if (userRole !== 'observer') roster.push('user');

        // First turn after opening - moderator goes first if exists
        if (!currentTurn) {
            // If there's a moderator, let them facilitate first
            if (moderator) {
                return {
                    nextTurn: moderator.id,
                    instruction: `[SYSTEM]: Opening floor. Moderator ${moderator.name}, please guide the first speaker.`,
                    phase: 'discussion'
                };
            }
            const nextId = roster[0];
            const firstName = agents.find(a => a.id === nextId)?.name || nextId;
            return {
                nextTurn: nextId,
                instruction: `[SYSTEM]: Opening floor. ${firstName} is speaking next.`,
                phase: 'discussion'
            };
        }

        // Explicit Transition: If Moderator just spoke (e.g. Opening), pass to First Participant
        if (moderator && currentTurn === moderator.id) {
            const nextId = roster[0];
            const firstName = agents.find(a => a.id === nextId)?.name || nextId;
            return {
                nextTurn: nextId,
                instruction: `[SYSTEM]: Opening finished. ${firstName} is speaking next.`,
                phase: 'discussion'
            };
        }

        const currentIndex = roster.indexOf(currentTurn);
        if (currentIndex === -1) {
            return {
                nextTurn: roster[0],
                instruction: `[SYSTEM]: Resuming discussion. ${agents.find(a => a.id === roster[0])?.name} is up.`,
                phase: 'discussion'
            };
        }

        const nextIndex = (currentIndex + 1) % roster.length;
        const nextId = roster[nextIndex];
        const nextName = agents.find(a => a.id === nextId)?.name || nextId;

        return { nextTurn: nextId, instruction: `[SYSTEM]: Next speaker: ${nextName}.`, phase: 'discussion' };
    }

    // 2. Custom Mode: Round Limited
    if (debateMode === 'custom') {
        const roster = participants.map(p => p.id);

        // Moderator facilitates first
        if (!currentTurn && moderator) {
            return {
                nextTurn: moderator.id,
                instruction: `[SYSTEM]: Round ${currentRound} begins. Moderator ${moderator.name}, please introduce the round.`,
                nextRound: currentRound,
                phase: 'discussion'
            };
        }

        if (!currentTurn || currentTurn === moderator?.id) {
            return {
                nextTurn: roster[0],
                instruction: `[SYSTEM]: Round ${currentRound} starts. ${roster[0]} is up.`,
                nextRound: currentRound,
                phase: 'discussion'
            };
        }

        const currentIndex = roster.indexOf(currentTurn);
        if (currentIndex === roster.length - 1) {
            // End of round
            if (currentRound >= maxRounds) {
                return {
                    nextTurn: moderator?.id || null,
                    instruction: `[SYSTEM]: Max rounds reached. Moderator, please summarize and conclude.`,
                    phase: 'discussion'
                };
            }
            const nextName = agents.find(a => a.id === roster[0])?.name || roster[0];
            return {
                nextTurn: roster[0],
                instruction: `[SYSTEM]: Round ${currentRound + 1} starts. ${nextName} is up.`,
                nextRound: currentRound + 1,
                phase: 'discussion'
            };
        }

        const nextId = roster[currentIndex + 1];
        const nextName = agents.find(a => a.id === nextId)?.name || nextId;
        return { nextTurn: nextId, instruction: `[SYSTEM]: Round ${currentRound}: next is ${nextName}.`, phase: 'discussion' };
    }

    // 3. Classic Mode: Stage Driven
    const pro = agents.find(a => a.stance === 'pro') || participants[0];
    const con = agents.find(a => a.stance === 'con') || participants[1] || pro;

    const stageSequence: ClassicStage[] = [
        'introduction', 'pro_opening', 'con_opening', 'pro_rebuttal',
        'con_rebuttal', 'free', 'pro_summary', 'con_summary', 'conclusion'
    ];

    const currentIdx = stageSequence.indexOf(currentStage);

    // If we're already at conclusion stage and moderator has spoken, end the debate
    if (currentStage === 'conclusion') {
        const moderatorHasSpoken = history.some(m =>
            m.senderId === moderator?.id &&
            !m.isThinking &&
            m.content.length > 50 // Ensure it's a substantial message, not just a signal
        );
        if (moderatorHasSpoken) {
            return {
                nextTurn: null,
                instruction: "[SYSTEM]: Debate concluded.",
                phase: 'conclusion'
            };
        }
    }

    const nextStage = currentIdx < stageSequence.length - 1 ? stageSequence[currentIdx + 1] : null;

    if (!nextStage) return {
        nextTurn: null,
        instruction: "[SYSTEM]: Debate concluded.",
        phase: 'conclusion'
    };

    const getTargetForStage = (stage: ClassicStage) => {
        switch (stage) {
            case 'introduction': return moderator?.id || 'system';
            case 'pro_opening': return pro.id;
            case 'con_opening': return con.id;
            case 'pro_rebuttal': return pro.id;
            case 'con_rebuttal': return con.id;
            case 'free': return moderator?.id || pro.id;
            case 'pro_summary': return pro.id;
            case 'con_summary': return con.id;
            case 'conclusion': return moderator?.id || 'system';
            default: return null;
        }
    };

    const targetId = getTargetForStage(nextStage);
    const targetName = agents.find(a => a.id === targetId)?.name || (targetId === 'system' ? 'ChaosLM' : 'Unknown');

    const stageLabels: Record<ClassicStage, { label: string; instruction: string }> = {
        introduction: {
            label: "Opening and Introduction",
            instruction: `[MODERATOR_OPENING]: Welcome participants and introduce the debate topic. Set the stage for the discussion.`
        },
        pro_opening: {
            label: "Pro Affirmative Opening Statement",
            instruction: `[PRO_OPENING]: Present your affirmative position on the topic. State your main arguments clearly.`
        },
        con_opening: {
            label: "Con Opposition Opening Statement",
            instruction: `[CON_OPENING]: Present your opposition position on the topic. State your counter-arguments clearly.`
        },
        pro_rebuttal: {
            label: "Pro Rebuttal",
            instruction: `[PRO_REBUTTAL]: Respond to the opposition's opening statement. Address their main points and strengthen your position.`
        },
        con_rebuttal: {
            label: "Con Rebuttal",
            instruction: `[CON_REBUTTAL]: Respond to the pro's rebuttal. Defend your position and counter their arguments.`
        },
        free: {
            label: "Free Debate Session",
            instruction: `[MODERATOR_FACILITATE]: Facilitate the free debate. Allow both sides to engage directly and explore key tensions.`
        },
        pro_summary: {
            label: "Pro Closing Summary",
            instruction: `[PRO_SUMMARY]: Summarize your key arguments and restate why your position is stronger. No new arguments.`
        },
        con_summary: {
            label: "Con Closing Summary",
            instruction: `[CON_SUMMARY]: Summarize your key arguments and restate why your position is stronger. No new arguments.`
        },
        conclusion: {
            label: "Final Conclusion by Moderator",
            instruction: `[MODERATOR_CONCLUSION]: This is the FINAL conclusion of the debate. Synthesize the key arguments from both sides, acknowledge the core tensions explored, and provide a thoughtful closing perspective. The debate ends after your statement.`
        }
    };

    const stageInfo = stageLabels[nextStage];

    return {
        nextTurn: targetId,
        instruction: `${stageInfo.instruction} [Phase: ${stageInfo.label}]`,
        nextStage: nextStage,
        phase: 'discussion'
    };
}

/**
 * Predicts the next N speakers based on current state.
 * Used for UI "Next Up" display and for Agent Context.
 */
export function getUpcomingSpeakers(state: IRoomState, count: number = 3): string[] {
    const { debateMode, currentTurn, agents, userRole } = state;
    const participants = agents.filter(a => a.role !== 'host');
    const moderator = agents.find(a => a.role === 'host');

    // Simulate state advancement to find next speakers
    // This is a simplified projection
    const upcoming: string[] = [];

    // Create a mock state to step through
    const mockTurn = currentTurn;
    const mockStage = state.currentStage;
    // We strictly need to know the roster order for standard/custom
    const roster = participants.map(p => p.id);
    if (debateMode === 'standard' && userRole !== 'observer') roster.push('user');

    // 1. Standard Mode Prediction (Round Robin)
    if (debateMode === 'standard') {
        if (!roster.length) return [];

        let currentIndex = roster.indexOf(mockTurn || roster[roster.length - 1]);

        // If we currently have a moderator speaking (e.g. opening), next is 0
        if (moderator && mockTurn === moderator.id) {
            currentIndex = -1; // So next becomes 0
        }

        for (let i = 0; i < count; i++) {
            currentIndex = (currentIndex + 1) % roster.length;
            upcoming.push(roster[currentIndex]);
        }
    }

    // 2. Custom Mode Prediction (Round Robin with Round Limits)
    else if (debateMode === 'custom') {
        if (!roster.length) return [];

        let currentIndex = roster.indexOf(mockTurn || roster[roster.length - 1]);

        // If moderator speaking, next is 0
        if (mockTurn === moderator?.id) {
            currentIndex = -1;
        }

        for (let i = 0; i < count; i++) {
            // Simplified: just loop roster. doesn't account for max rounds termination for prediction
            currentIndex = (currentIndex + 1);
            if (currentIndex >= roster.length) currentIndex = 0;
            upcoming.push(roster[currentIndex]);
        }
    }

    // 3. Classic Mode (Stage Sequence)
    else if (debateMode === 'classic') {
        const stageSequence: ClassicStage[] = [
            'introduction', 'pro_opening', 'con_opening',
            'pro_rebuttal', 'con_rebuttal',
            'free',
            'pro_summary', 'con_summary', 'conclusion'
        ];

        const pro = agents.find(a => a.stance === 'pro') || participants[0];
        const con = agents.find(a => a.stance === 'con') || participants[1];

        let currentStageIdx = stageSequence.indexOf(mockStage);

        for (let i = 0; i < count; i++) {
            currentStageIdx++;
            if (currentStageIdx >= stageSequence.length) break;

            const stage = stageSequence[currentStageIdx];
            let speakerId = '';

            if (stage.includes('pro')) speakerId = pro?.id;
            else if (stage.includes('con')) speakerId = con?.id;
            else if (stage === 'free') speakerId = 'free'; // Special case
            else if (stage === 'conclusion') speakerId = moderator?.id || 'system';

            if (speakerId) upcoming.push(speakerId);
        }
    }

    return upcoming;
}

