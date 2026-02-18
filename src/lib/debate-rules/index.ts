// Auto-generated from Markdown files. Do not edit manually.
// Run \`npx tsx scripts/generate-rules.ts\` to regenerate after editing .md files.

import { DebateMode, IRoomState, IAgent } from "@/types";

const standardRules = `# 自由模式 / Free Mode (Chaos Mode)

## Overview / 模式概述

Unbounded, free-flowing discussion that embraces chaos and emergence. No fixed stances, no rigid structure—just pure intellectual exploration where ideas collide, merge, and evolve organically. This mode embodies the spirit of ChaosLM: unpredictable, creative, and unrestricted.

无边界、自由流动的讨论，拥抱混乱与涌现。没有固定立场，没有僵化结构——纯粹的知识探索，思想在此碰撞、融合、有机演化。此模式体现 ChaosLM 的精神：不可预测、富有创意、无拘无束。

## Characteristics / 模式特点

- **Chaos-friendly / 拥抱混乱**: Celebrate unexpected tangents and wild associations
- **No Fixed Stances / 无固定立场**: Participants flow between perspectives organically
- **Emergent Structure / 涌现结构**: Discussion finds its own form through interaction
- **Unbounded Exploration / 无限制探索**: No topic is off-limits, no idea too crazy
- **Anti-fragile / 反脆弱**: Disorder and disagreement strengthen the discourse

## Rules / 规则

1. Follow the energy—if a tangent is interesting, pursue it ruthlessly
2. No need to maintain consistent positions; changing your mind is encouraged
3. Prioritize intellectual excitement over rigid argumentation
4. Interrupt, question, and challenge at will (respectfully)
5. The moderator may introduce chaos factors (random topics, role swaps) at any time
6. Discussion continues until natural exhaustion or moderator calls end

## Turn Order / 发言顺序

1. **Opening / 开场**: Moderator sets the chaotic tone and declares the topic is merely a starting point
2. **Free Flow / 自由流动**: Participants speak whenever moved to speak (no fixed order)
3. **Chaos Events / 混乱事件**: Moderator may randomly redirect, introduce constraints, or swap roles
4. **Conclusion / 结束**: When ideas are exhausted, moderator synthesizes the chaos into insights

## Token Guidelines / Token 指引

- **Soft Limit / 软限制**: 1000-1500 tokens per turn
- **Philosophy / 理念**: Be detailed and thorough, but avoid repetition and filler
- **Quality over Quantity / 质量优于数量**: Every sentence should add new insight

## Moderator Responsibilities / 主持人职责

- Seed chaos strategically to prevent stagnation
- Ensure no single voice dominates too long
- Recognize and amplify emerging patterns from the noise
- Synthesize diverse perspectives without forcing consensus

## @Mention Mechanism / @提及机制

Use \`@MemberName\` to create sudden shifts in focus:
- Example: "@Alice Your chaos just collided with @Bob's order—what emerges?"
- Use for unexpected connections, challenges, or collaborations
`;

const classicRules = `# 经典辩论模式 / Classic Debate Mode

## Overview / 模式概述

Formal structured debate with assigned stances (Pro/Con) and defined phases. This mode follows traditional parliamentary debate structure adapted for LLM participants—with token limits replacing time constraints.

具有固定立场（正方/反方）和明确阶段的正式结构化辩论。此模式遵循传统议会辩论结构，针对 LLM 参与者进行了调整——使用 Token 限制替代时间约束。

## Characteristics / 模式特点

- **Assigned Stances / 固定立场**: Participants designated as Pro (Affirmative/正方) or Con (Opposition/反方)
- **Structured Phases / 结构化阶段**: Fixed sequence of debate stages
- **Token Limits / Token 限制**: Output length constraints instead of time limits
- **Adversarial / 对抗性**: Focus on logical argumentation and evidence

## Rules / 规则

1. Strict adherence to assigned stance (Pro/Con)
2. Follow the formal debate sequence
3. Focus on logical argumentation and evidence
4. Rebuttals must address specific opposing points
5. Respect token limits for each phase

## Debate Phases (Fixed Sequence) / 辩论阶段（固定顺序）

### Phase 1: Introduction / 开场阶段
- **Speaker / 发言人**: Moderator / 主持人
- **Purpose / 目的**: Welcome participants, introduce topic, explain rules
- **Token Limit / Token 限制**: 300-500 tokens

### Phase 2: Pro Opening Statement / 正方立论
- **Speaker / 发言人**: Pro (Affirmative) side / 正方
- **Purpose / 目的**: Present main arguments supporting the proposition
- **Token Limit / Token 限制**: 800-1200 tokens (~600-900 words / 约600-900字)
- **Content / 内容**: Define key terms, present core arguments, outline evidence

### Phase 3: Con Opening Statement / 反方立论
- **Speaker / 发言人**: Con (Opposition) side / 反方
- **Purpose / 目的**: Present main arguments against the proposition
- **Token Limit / Token 限制**: 800-1200 tokens (~600-900 words / 约600-900字)
- **Content / 内容**: Challenge definitions, present counter-arguments, outline opposing evidence

### Phase 4: Pro Rebuttal / 正方反驳
- **Speaker / 发言人**: Pro side / 正方
- **Purpose / 目的**: Respond to Con's opening, defend own position
- **Token Limit / Token 限制**: 600-800 tokens (~450-600 words / 约450-600字)
- **Content / 内容**: Address Con's points, reinforce Pro arguments, clarify misunderstandings

### Phase 5: Con Rebuttal / 反方反驳
- **Speaker / 发言人**: Con side / 反方
- **Purpose / 目的**: Respond to Pro's rebuttal, defend own position
- **Token Limit / Token 限制**: 600-800 tokens (~450-600 words / 约450-600字)
- **Content / 内容**: Counter Pro's responses, strengthen opposition stance

### Phase 6: Free Debate / 自由辩论
- **Speaker / 发言人**: Moderator facilitates, both sides participate / 主持人引导，双方参与
- **Purpose / 目的**: Direct engagement between opposing sides
- **Token Limit / Token 限制**: 1000-1500 tokens per turn / 每次发言 (~750-1100 words / 约750-1100字)
- **Content / 内容**: Cross-examination, clarifying questions, addressing specific points

### Phase 7: Pro Summary / 正方总结
- **Speaker / 发言人**: Pro side / 正方
- **Purpose / 目的**: Summarize key arguments, no new points
- **Token Limit / Token 限制**: 400-600 tokens (~300-450 words / 约300-450字)
- **Content / 内容**: Recap strongest arguments, highlight Con's weaknesses

### Phase 8: Con Summary / 反方总结
- **Speaker / 发言人**: Con side / 反方
- **Purpose / 目的**: Summarize key arguments, no new points
- **Token Limit / Token 限制**: 400-600 tokens (~300-450 words / 约300-450字)
- **Content / 内容**: Recap strongest counter-arguments, highlight Pro's weaknesses

### Phase 9: Conclusion / 结束阶段
- **Speaker / 发言人**: Moderator / 主持人
- **Purpose / 目的**: Final summary and official end
- **Token Limit / Token 限制**: 500-800 tokens
- **Content / 内容**: Synthesize both sides, acknowledge key tensions, declare debate concluded

## Participant Roles / 参与者角色

### Pro (Affirmative) / 正方
- **Stance / 立场**: Supports the proposition/topic / 支持辩题
- **Goal / 目标**: Prove the proposition is true/desirable / 证明辩题为真/可取
- **Strategy / 策略**: Build logical case, provide evidence, anticipate opposition

### Con (Opposition) / 反方
- **Stance / 立场**: Opposes the proposition/topic / 反对辩题
- **Goal / 目标**: Prove the proposition is false/undesirable / 证明辩题为假/不可取
- **Strategy / 策略**: Identify flaws in Pro's case, present counter-evidence

### Moderator / 主持人
- **Stance / 立场**: Neutral / 中立
- **Goal / 目标**: Ensure fair process, maintain structure / 确保公平流程，维持结构
- **Strategy / 策略**: Enforce token limits, intervene when rules broken, facilitate transitions

## @Mention Mechanism / @提及机制

During Free Debate phase, participants can use \`@MemberName\` for direct engagement:
- Example: "@ProSpeaker You claimed X, but evidence shows Y..."
- Use for direct questions and targeted rebuttals
- Moderator can use @mentions to direct speaking turns

## Winning Criteria / 评判标准

While Classic debate doesn't have automated "winners", evaluation considers:
- **Argument Strength / 论证力度**: Logic, evidence, coherence
- **Rebuttal Effectiveness / 反驳效果**: Addressing opponent's points
- **Adherence to Rules / 规则遵守**: Following structure and token limits
- **Presentation / 表达质量**: Clarity, organization, persuasiveness
`;

const customRules = `# 自定义轮次模式 / Custom Rounds Mode

## Overview / 模式概述

Round-limited debate with assigned stances. Each participant has a fixed number of speaking opportunities, with token limits ensuring balanced contribution and concise expression.

具有固定立场的轮次限制辩论。每位参与者有固定次数的发言机会，通过 Token 限制确保贡献均衡和表达简洁。

## Characteristics / 模式特点

- **Round Limit / 轮次限制**: Each participant gets exactly N speaking rounds
- **Assigned Stances / 固定立场**: Participants designated as Pro/Con/Neutral
- **Token Boundaries / Token 边界**: Output limits encourage concise, impactful statements
- **Flexible Content / 灵活内容**: Each round can be used for arguments, rebuttals, or questions

## Rules / 规则

1. Each participant has limited speaking rounds (configurable)
2. Maintain assigned stance throughout
3. Fair and controlled turn distribution
4. Respect token limits per turn
5. No participant may speak twice consecutively (unless only 2 participants)
6. Debate ends after all rounds completed or manual end

## Turn Structure / 发言结构

### Round Format / 轮次格式
- **Round Start / 轮次开始**: Moderator introduces the round number
- **Speaking Order / 发言顺序**: Participants take turns in fixed rotation
- **Round End / 轮次结束**: When all participants have spoken once
- **Next Round / 下一轮**: Begin new round with same rotation

### Token Limits / Token 限制
- **Per Turn / 每次发言**: 600-1000 tokens (~450-750 words / 约450-750字)
- **Total per Participant / 每人总计**: Rounds × Tokens per turn
- **Moderator Discretion / 主持人裁量**: Can adjust limits based on content depth

**Rationale / 理由**: The 600-1000 token range allows for:
- Substantive arguments with evidence and reasoning
- Detailed rebuttals addressing multiple points
- Sufficient depth without redundancy
- Efficient information density

## Round Progression / 轮次进程

\`\`\`
Round 1:
  - Participant A speaks (600-1000 tokens)
  - Participant B speaks (600-1000 tokens)
  - Participant C speaks (600-1000 tokens, if exists)
  - [User speaks if participating]

Round 2:
  - Participant A speaks (600-1000 tokens)
  - Participant B speaks (600-1000 tokens)
  - ...

...until max rounds reached
\`\`\`

## Participant Strategy / 参与者策略

### Planning Your Rounds / 规划你的轮次
With limited rounds and token constraints, participants must strategically allocate their output:

**Round 1 / 第1轮**: Opening position
- Present main argument with core evidence (aim for ~800 tokens)
- Establish stance clearly
- Leave room for follow-up elaboration

**Round 2 / 第2轮**: Rebuttal/Development
- Address opponent's opening (~600-800 tokens)
- Strengthen own position with additional evidence
- Respond to specific claims efficiently

**Round 3+ / 第3轮+**: Deepening/Conclusion
- Address specific points with precision (~600 tokens)
- Final strengthening of position
- Avoid repetition of earlier points

### Tips for Limited Rounds / 有限轮次技巧
- **Precision over Volume / 精确优于数量**: Every token must carry weight
- **Prioritize Strongest Arguments / 优先最强论点**: Lead with your best evidence
- **Listen Strategically / 策略性倾听**: Use opponent's words to craft efficient rebuttals
- **Don't Waste Tokens / 不浪费 Token**: Avoid filler phrases and redundant restatements

## Moderator Responsibilities / 主持人职责

- Track round count for each participant
- Announce round transitions
- Monitor token usage and warn when approaching limits
- Enforce "no consecutive speaking" rule
- Declare debate end when max rounds reached

## @Mention Mechanism / @提及机制

Participants can use \`@MemberName\` within their turns:
- Example: "@Opponent In your first round, you argued X, but I believe Y..."
- Helps focus limited speaking time on specific counter-arguments
- Creates accountability for direct responses

## Debate End Conditions / 结束条件

1. **Natural End / 自然结束**: All participants have used all rounds
2. **Manual End / 手动结束**: Moderator/user decides to conclude early
3. **Summary Phase / 总结阶段**: After final round, moderator provides synthesis

## Configuration / 配置

- **Max Rounds / 最大轮次**: Set during setup (recommended: 2-4 rounds / 建议2-4轮)
- **Tokens per Turn / 每轮Token**: Configurable (default: 600-1000 tokens)
- **Stance Assignment / 立场分配**: Pro/Con/Neutral assigned per participant
- **Speaking Order / 发言顺序**: Deterministic (by participant join order)
`;

export const debateRulesContent: Record<DebateMode, string> = {
    standard: standardRules,
    classic: classicRules,
    custom: customRules,
};

export interface ParticipantInfo {
    id: string;
    name: string;
    role: 'host' | 'assistant';
    stance?: 'pro' | 'con' | 'neutral';
    stanceLabel?: string;
    modelId: string;
}

export function getParticipantInfo(agents: IAgent[], language: 'en' | 'zh' = 'en'): ParticipantInfo[] {
    const stanceMap = {
        pro: { en: 'Pro (Affirmative)', zh: '正方' },
        con: { en: 'Con (Opposition)', zh: '反方' },
        neutral: { en: 'Neutral', zh: '中立' }
    };

    return agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        stance: agent.stance,
        stanceLabel: agent.stance ? stanceMap[agent.stance][language] : undefined,
        modelId: agent.modelId,
    }));
}

export function generateBootstrapContext(state: IRoomState, language: 'en' | 'zh' = 'en'): string {
    const rules = debateRulesContent[state.debateMode];
    const participants = getParticipantInfo(state.agents, language);
    const moderator = participants.find(p => p.role === 'host');
    const debaters = participants.filter(p => p.role !== 'host');

    const isZh = language === 'zh';

    let context = isZh
        ? `# 讨论准备材料\n\n## 主题\n${state.topic}\n\n## 模式规则\n${rules}\n\n`
        : `# Debate Preparation Material\n\n## Topic\n${state.topic}\n\n## Mode Rules\n${rules}\n\n`;

    // Moderator Section
    if (moderator) {
        context += isZh
            ? `## 主持人信息\n\n- **姓名**: ${moderator.name}\n- **模型**: ${moderator.modelId}\n- **职责**: 引导讨论、维持秩序、总结观点\n\n`
            : `## Moderator Information\n\n- **Name**: ${moderator.name}\n- **Model**: ${moderator.modelId}\n- **Responsibilities**: Facilitate discussion, maintain order, summarize viewpoints\n\n`;
    }

    // Participants Section with detailed info
    if (debaters.length > 0) {
        context += isZh ? `## 参与者详细信息\n\n` : `## Participant Details\n\n`;

        debaters.forEach((p, i) => {
            const stanceInfo = p.stanceLabel ? ` (${p.stanceLabel})` : '';
            context += isZh
                ? `${i + 1}. **${p.name}**${stanceInfo}\n   - ID: ${p.id}\n   - 模型: ${p.modelId}\n   - 立场: ${p.stanceLabel || '未分配'}\n\n`
                : `${i + 1}. **${p.name}**${stanceInfo}\n   - ID: ${p.id}\n   - Model: ${p.modelId}\n   - Stance: ${p.stanceLabel || 'Not assigned'}\n\n`;
        });
    }

    // Turn Order Instructions for Moderator
    context += generateTurnOrderInstructions(state, language);

    return context;
}

function generateTurnOrderInstructions(state: IRoomState, language: 'en' | 'zh'): string {
    const isZh = language === 'zh';
    const participants = state.agents.filter(a => a.role !== 'host');

    let instructions = isZh
        ? `## 发言顺序与调度规则\n\n`
        : `## Turn Order and Scheduling Rules\n\n`;

    switch (state.debateMode) {
        case 'standard': {
            const participantList = participants.map((p, i) =>
                isZh ? `   ${i + 1}. ${p.name}` : `   ${i + 1}. ${p.name}`
            ).join('\n');

            instructions += isZh
                ? `### 标准模式调度规则\n\n1. **开场**: 主持人首先发言\n2. **发言顺序**: 参与者按以下顺序轮流发言:\n${participantList}\n3. **自由插入**: 主持人可随时引导特定成员发言\n4. **结束**: 主持人总结并宣布结束\n\n`
                : `### Standard Mode Scheduling\n\n1. **Opening**: Moderator speaks first\n2. **Order**: Participants take turns:\n${participantList}\n3. **Direction**: Moderator can direct specific members\n4. **Conclusion**: Moderator summarizes and ends\n\n`;
            break;
        }

        case 'classic': {
            const pro = participants.find(a => a.stance === 'pro');
            const con = participants.find(a => a.stance === 'con');
            instructions += isZh
                ? `### 经典辩论模式调度规则\n\n**阶段顺序**:\n1. 主持人开场\n2. ${pro?.name || '正方'} - 立论陈述\n3. ${con?.name || '反方'} - 立论陈述\n4. ${pro?.name || '正方'} - 反驳\n5. ${con?.name || '反方'} - 反驳\n6. 自由辩论\n7. ${pro?.name || '正方'} - 总结\n8. ${con?.name || '反方'} - 总结\n9. 主持人最终裁决\n\n**重要提醒**:\n- 每个阶段只有指定发言人可以发言\n- 主持人负责宣布阶段转换\n\n`
                : `### Classic Debate Scheduling\n\n**Phase Order**:\n1. Moderator opening\n2. ${pro?.name || 'Pro'} - Opening\n3. ${con?.name || 'Con'} - Opening\n4. ${pro?.name || 'Pro'} - Rebuttal\n5. ${con?.name || 'Con'} - Rebuttal\n6. Free Debate\n7. ${pro?.name || 'Pro'} - Summary\n8. ${con?.name || 'Con'} - Summary\n9. Moderator conclusion\n\n**Important**:\n- Only designated speaker per phase\n- Moderator announces transitions\n\n`;
            break;
        }

        case 'custom': {
            const participantList = participants.map((p, i) =>
                `   ${i + 1}. ${p.name}`
            ).join('\n');

            instructions += isZh
                ? `### 自定义轮次模式调度规则\n\n**总轮次**: ${state.maxRounds} 轮/人\n\n**发言顺序** (每轮重复):\n${participantList}\n\n**规则**:\n- 每轮每位参与者发言一次\n- 第 ${state.maxRounds} 轮结束后进入总结\n\n`
                : `### Custom Rounds Scheduling\n\n**Total Rounds**: ${state.maxRounds} rounds/person\n\n**Speaking Order** (each round):\n${participantList}\n\n**Rules**:\n- One turn per participant per round\n- Summary after round ${state.maxRounds}\n\n`;
            break;
        }
    }

    // @mention guide
    instructions += isZh
        ? `### @提及机制使用指南\n\n主持人可以使用 @成员名 来:\n1. 直接点名某位参与者发言\n2. 要求特定成员回应某个观点\n3. 平衡讨论(让少发言的成员参与)\n\n示例:\n- "@张三 请对刚才的观点发表看法"\n- "@李四 你作为正方代表,如何回应?"\n`
        : `### @Mention Mechanism\n\nModerators can use @MemberName to:\n1. Directly invite a specific participant\n2. Request response to a viewpoint\n3. Balance discussion participation\n\nExamples:\n- "@Alice Please share your thoughts"\n- "@Bob As Pro representative, how do you respond?"\n`;

    return instructions;
}

export function generateSystemBootstrapPrompt(state: IRoomState, language: 'en' | 'zh' = 'en'): string {
    const isZh = language === 'zh';
    const participants = getParticipantInfo(state.agents, language);
    const modeName = isZh
        ? (state.debateMode === 'standard' ? '标准讨论' : state.debateMode === 'classic' ? '经典辩论' : '自定义轮次')
        : state.debateMode;

    return isZh
        ? `你是 ChaosLM 系统，本次讨论的幕后导演。\n\n话题："${state.topic}"\n模式：${modeName}\n\n参与者信息：\n${participants.map(p => `- ${p.name}${p.stanceLabel ? ` (${p.stanceLabel})` : ''}`).join('\n')}\n\n要求：\n1. 生成客观、无主观倾向的背景介绍（200-300字）\n2. 列出讨论的议题范围和目标\n3. 说明各参与者的角色和分工\n4. 根据模式说明调度规则和发言顺序\n5. 强调讨论规则和@提及机制\n\n注意：作为幕后导演，你的材料将被注入给主持人作为指导，不要表达个人立场。`
        : `You are the ChaosLM System, the director behind this discussion.\n\nTopic: "${state.topic}"\nMode: ${modeName}\n\nParticipants:\n${participants.map(p => `- ${p.name}${p.stanceLabel ? ` (${p.stanceLabel})` : ''}`).join('\n')}\n\nRequirements:\n1. Generate objective background (200-300 words)\n2. List scope and objectives\n3. Explain participant roles\n4. Explain scheduling rules\n5. Emphasize rules and @mention mechanism\n\nNote: Your material will guide the moderator. Do not express personal stances.`;
}

export function generateChaosLMOpeningPrompt(state: IRoomState, bootstrapContext: string, language: 'en' | 'zh' = 'en'): string {
    const isZh = language === 'zh';
    const participants = getParticipantInfo(state.agents, language);

    return isZh
        ? `你是 ChaosLM，本次讨论的引导者。用户选择担任主持人角色。\n\n讨论准备材料：\n${bootstrapContext}\n\n参与者列表：\n${participants.map(p => `- ${p.name}${p.stanceLabel ? ` (${p.stanceLabel})` : ''}`).join('\n')}\n\n作为开场，你需要：\n1. 欢迎所有参与者\n2. 简要介绍讨论主题和背景\n3. 介绍各位参与者及其代表的观点/立场\n4. 说明本模式的调度规则（发言顺序、阶段等）\n5. 介绍@提及机制的使用方法\n6. 将发言权交给用户主持人\n\n语气：专业、热情、简洁（150-200字）。`
        : `You are ChaosLM, the facilitator. The user acts as moderator.\n\nPreparation Materials:\n${bootstrapContext}\n\nParticipants:\n${participants.map(p => `- ${p.name}${p.stanceLabel ? ` (${p.stanceLabel})` : ''}`).join('\n')}\n\nOpening tasks:\n1. Welcome all participants\n2. Briefly introduce topic and background\n3. Introduce each participant and stance\n4. Explain scheduling rules\n5. Introduce @mention mechanism\n6. Hand over to user moderator\n\nTone: Professional, enthusiastic, concise (150-200 words).`;
}

export function generateAIHostOpeningPrompt(state: IRoomState, bootstrapContext: string, language: 'en' | 'zh' = 'en'): string {
    const isZh = language === 'zh';
    const participants = getParticipantInfo(state.agents, language);

    return isZh
        ? `你是本次讨论的 AI 主持人。\n\n完整准备材料：\n${bootstrapContext}\n\n参与者信息：\n${participants.map(p => `- ${p.name}${p.stanceLabel ? ` (${p.stanceLabel})` : ''} - ID: ${p.id}`).join('\n')}\n\n作为开场白，你需要：\n1. 以主持人身份热情欢迎所有参与者\n2. 介绍讨论主题的背景和意义\n3. 逐一介绍参与者（姓名、立场、角色）\n4. 清晰说明本模式的调度规则和发言顺序\n5. 解释@提及机制及其使用方法\n6. 宣布讨论正式开始，并说明第一个发言者\n\n语气：专业、权威但不失亲和，像一位经验丰富的主持人。字数控制在250-350字。`
        : `You are the AI Moderator.\n\nPreparation Materials:\n${bootstrapContext}\n\nParticipants:\n${participants.map(p => `- ${p.name}${p.stanceLabel ? ` (${p.stanceLabel})` : ''} - ID: ${p.id}`).join('\n')}\n\nOpening speech tasks:\n1. Warmly welcome all participants\n2. Introduce topic background\n3. Introduce each participant (name, stance, role)\n4. Explain scheduling rules\n5. Explain @mention mechanism\n6. Declare official start and first speaker\n\nTone: Professional, authoritative yet approachable. 250-350 words.`;
}
