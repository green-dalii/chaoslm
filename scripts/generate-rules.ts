/**
 * Build-time script to convert Markdown rule files to a TypeScript module.
 * Keeps source files human-readable (Markdown) while allowing clean imports.
 *
 * Run this when rules change: npx tsx scripts/generate-rules.ts
 * Or it runs automatically during dev/build via package.json scripts.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULES_DIR = join(__dirname, '../src/lib/debate-rules');

const rules = ['standard', 'classic', 'custom'] as const;

function generate() {
    const content: string[] = [];

    for (const name of rules) {
        const mdPath = join(RULES_DIR, `${name}.md`);
        const mdContent = readFileSync(mdPath, 'utf-8');

        // Escape for TypeScript template literal
        const escaped = mdContent
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$');

        content.push(`const ${name}Rules = \`${escaped}\`;`);
    }

    const tsContent = `// Auto-generated from Markdown files. Do not edit manually.
// Run \\\`npx tsx scripts/generate-rules.ts\\\` to regenerate after editing .md files.

import { DebateMode, IRoomState, IAgent } from "@/types";

${content.join('\n\n')}

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
        ? \`# 讨论准备材料\\n\\n## 主题\\n\${state.topic}\\n\\n## 模式规则\\n\${rules}\\n\\n\`
        : \`# Debate Preparation Material\\n\\n## Topic\\n\${state.topic}\\n\\n## Mode Rules\\n\${rules}\\n\\n\`;

    // Moderator Section
    if (moderator) {
        context += isZh
            ? \`## 主持人信息\\n\\n- **姓名**: \${moderator.name}\\n- **模型**: \${moderator.modelId}\\n- **职责**: 引导讨论、维持秩序、总结观点\\n\\n\`
            : \`## Moderator Information\\n\\n- **Name**: \${moderator.name}\\n- **Model**: \${moderator.modelId}\\n- **Responsibilities**: Facilitate discussion, maintain order, summarize viewpoints\\n\\n\`;
    }

    // Participants Section with detailed info
    if (debaters.length > 0) {
        context += isZh ? \`## 参与者详细信息\\n\\n\` : \`## Participant Details\\n\\n\`;

        debaters.forEach((p, i) => {
            const stanceInfo = p.stanceLabel ? \` (\${p.stanceLabel})\` : '';
            context += isZh
                ? \`\${i + 1}. **\${p.name}**\${stanceInfo}\\n   - ID: \${p.id}\\n   - 模型: \${p.modelId}\\n   - 立场: \${p.stanceLabel || '未分配'}\\n\\n\`
                : \`\${i + 1}. **\${p.name}**\${stanceInfo}\\n   - ID: \${p.id}\\n   - Model: \${p.modelId}\\n   - Stance: \${p.stanceLabel || 'Not assigned'}\\n\\n\`;
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
        ? \`## 发言顺序与调度规则\\n\\n\`
        : \`## Turn Order and Scheduling Rules\\n\\n\`;

    switch (state.debateMode) {
        case 'standard': {
            const participantList = participants.map((p, i) =>
                isZh ? \`   \${i + 1}. \${p.name}\` : \`   \${i + 1}. \${p.name}\`
            ).join('\\n');

            instructions += isZh
                ? \`### 标准模式调度规则\\n\\n1. **开场**: 主持人首先发言\\n2. **发言顺序**: 参与者按以下顺序轮流发言:\\n\${participantList}\\n3. **自由插入**: 主持人可随时引导特定成员发言\\n4. **结束**: 主持人总结并宣布结束\\n\\n\`
                : \`### Standard Mode Scheduling\\n\\n1. **Opening**: Moderator speaks first\\n2. **Order**: Participants take turns:\\n\${participantList}\\n3. **Direction**: Moderator can direct specific members\\n4. **Conclusion**: Moderator summarizes and ends\\n\\n\`;
            break;
        }

        case 'classic': {
            const pro = participants.find(a => a.stance === 'pro');
            const con = participants.find(a => a.stance === 'con');
            instructions += isZh
                ? \`### 经典辩论模式调度规则\\n\\n**阶段顺序**:\\n1. 主持人开场\\n2. \${pro?.name || '正方'} - 立论陈述\\n3. \${con?.name || '反方'} - 立论陈述\\n4. \${pro?.name || '正方'} - 反驳\\n5. \${con?.name || '反方'} - 反驳\\n6. 自由辩论\\n7. \${pro?.name || '正方'} - 总结\\n8. \${con?.name || '反方'} - 总结\\n9. 主持人最终裁决\\n\\n**重要提醒**:\\n- 每个阶段只有指定发言人可以发言\\n- 主持人负责宣布阶段转换\\n\\n\`
                : \`### Classic Debate Scheduling\\n\\n**Phase Order**:\\n1. Moderator opening\\n2. \${pro?.name || 'Pro'} - Opening\\n3. \${con?.name || 'Con'} - Opening\\n4. \${pro?.name || 'Pro'} - Rebuttal\\n5. \${con?.name || 'Con'} - Rebuttal\\n6. Free Debate\\n7. \${pro?.name || 'Pro'} - Summary\\n8. \${con?.name || 'Con'} - Summary\\n9. Moderator conclusion\\n\\n**Important**:\\n- Only designated speaker per phase\\n- Moderator announces transitions\\n\\n\`;
            break;
        }

        case 'custom': {
            const participantList = participants.map((p, i) =>
                \`   \${i + 1}. \${p.name}\`
            ).join('\\n');

            instructions += isZh
                ? \`### 自定义轮次模式调度规则\\n\\n**总轮次**: \${state.maxRounds} 轮/人\\n\\n**发言顺序** (每轮重复):\\n\${participantList}\\n\\n**规则**:\\n- 每轮每位参与者发言一次\\n- 第 \${state.maxRounds} 轮结束后进入总结\\n\\n\`
                : \`### Custom Rounds Scheduling\\n\\n**Total Rounds**: \${state.maxRounds} rounds/person\\n\\n**Speaking Order** (each round):\\n\${participantList}\\n\\n**Rules**:\\n- One turn per participant per round\\n- Summary after round \${state.maxRounds}\\n\\n\`;
            break;
        }
    }

    // @mention guide
    instructions += isZh
        ? \`### @提及机制使用指南\\n\\n主持人可以使用 @成员名 来:\\n1. 直接点名某位参与者发言\\n2. 要求特定成员回应某个观点\\n3. 平衡讨论(让少发言的成员参与)\\n\\n示例:\\n- "@张三 请对刚才的观点发表看法"\\n- "@李四 你作为正方代表,如何回应?"\\n\`
        : \`### @Mention Mechanism\\n\\nModerators can use @MemberName to:\\n1. Directly invite a specific participant\\n2. Request response to a viewpoint\\n3. Balance discussion participation\\n\\nExamples:\\n- "@Alice Please share your thoughts"\\n- "@Bob As Pro representative, how do you respond?"\\n\`;

    return instructions;
}

export function generateSystemBootstrapPrompt(state: IRoomState, language: 'en' | 'zh' = 'en'): string {
    const isZh = language === 'zh';
    const participants = getParticipantInfo(state.agents, language);
    const modeName = isZh
        ? (state.debateMode === 'standard' ? '标准讨论' : state.debateMode === 'classic' ? '经典辩论' : '自定义轮次')
        : state.debateMode;

    return isZh
        ? \`你是 ChaosLM 系统，本次讨论的幕后导演。\\n\\n话题："\${state.topic}"\\n模式：\${modeName}\\n\\n参与者信息：\\n\${participants.map(p => \`- \${p.name}\${p.stanceLabel ? \` (\${p.stanceLabel})\` : ''}\`).join('\\n')}\\n\\n要求：\\n1. 生成客观、无主观倾向的背景介绍（200-300字）\\n2. 列出讨论的议题范围和目标\\n3. 说明各参与者的角色和分工\\n4. 根据模式说明调度规则和发言顺序\\n5. 强调讨论规则和@提及机制\\n\\n注意：作为幕后导演，你的材料将被注入给主持人作为指导，不要表达个人立场。\`
        : \`You are the ChaosLM System, the director behind this discussion.\\n\\nTopic: "\${state.topic}"\\nMode: \${modeName}\\n\\nParticipants:\\n\${participants.map(p => \`- \${p.name}\${p.stanceLabel ? \` (\${p.stanceLabel})\` : ''}\`).join('\\n')}\\n\\nRequirements:\\n1. Generate objective background (200-300 words)\\n2. List scope and objectives\\n3. Explain participant roles\\n4. Explain scheduling rules\\n5. Emphasize rules and @mention mechanism\\n\\nNote: Your material will guide the moderator. Do not express personal stances.\`;
}

export function generateChaosLMOpeningPrompt(state: IRoomState, bootstrapContext: string, language: 'en' | 'zh' = 'en'): string {
    const isZh = language === 'zh';
    const participants = getParticipantInfo(state.agents, language);

    return isZh
        ? \`你是 ChaosLM，本次讨论的引导者。用户选择担任主持人角色。\\n\\n讨论准备材料：\\n\${bootstrapContext}\\n\\n参与者列表：\\n\${participants.map(p => \`- \${p.name}\${p.stanceLabel ? \` (\${p.stanceLabel})\` : ''}\`).join('\\n')}\\n\\n作为开场，你需要：\\n1. 欢迎所有参与者\\n2. 简要介绍讨论主题和背景\\n3. 介绍各位参与者及其代表的观点/立场\\n4. 说明本模式的调度规则（发言顺序、阶段等）\\n5. 介绍@提及机制的使用方法\\n6. 将发言权交给用户主持人\\n\\n语气：专业、热情、简洁（150-200字）。\`
        : \`You are ChaosLM, the facilitator. The user acts as moderator.\\n\\nPreparation Materials:\\n\${bootstrapContext}\\n\\nParticipants:\\n\${participants.map(p => \`- \${p.name}\${p.stanceLabel ? \` (\${p.stanceLabel})\` : ''}\`).join('\\n')}\\n\\nOpening tasks:\\n1. Welcome all participants\\n2. Briefly introduce topic and background\\n3. Introduce each participant and stance\\n4. Explain scheduling rules\\n5. Introduce @mention mechanism\\n6. Hand over to user moderator\\n\\nTone: Professional, enthusiastic, concise (150-200 words).\`;
}

export function generateAIHostOpeningPrompt(state: IRoomState, bootstrapContext: string, language: 'en' | 'zh' = 'en'): string {
    const isZh = language === 'zh';
    const participants = getParticipantInfo(state.agents, language);

    return isZh
        ? \`你是本次讨论的 AI 主持人。\\n\\n完整准备材料：\\n\${bootstrapContext}\\n\\n参与者信息：\\n\${participants.map(p => \`- \${p.name}\${p.stanceLabel ? \` (\${p.stanceLabel})\` : ''} - ID: \${p.id}\`).join('\\n')}\\n\\n作为开场白，你需要：\\n1. 以主持人身份热情欢迎所有参与者\\n2. 介绍讨论主题的背景和意义\\n3. 逐一介绍参与者（姓名、立场、角色）\\n4. 清晰说明本模式的调度规则和发言顺序\\n5. 解释@提及机制及其使用方法\\n6. 宣布讨论正式开始，并说明第一个发言者\\n\\n语气：专业、权威但不失亲和，像一位经验丰富的主持人。字数控制在250-350字。\`
        : \`You are the AI Moderator.\\n\\nPreparation Materials:\\n\${bootstrapContext}\\n\\nParticipants:\\n\${participants.map(p => \`- \${p.name}\${p.stanceLabel ? \` (\${p.stanceLabel})\` : ''} - ID: \${p.id}\`).join('\\n')}\\n\\nOpening speech tasks:\\n1. Warmly welcome all participants\\n2. Introduce topic background\\n3. Introduce each participant (name, stance, role)\\n4. Explain scheduling rules\\n5. Explain @mention mechanism\\n6. Declare official start and first speaker\\n\\nTone: Professional, authoritative yet approachable. 250-350 words.\`;
}
`;

    writeFileSync(join(RULES_DIR, 'index.ts'), tsContent);
    console.log('✓ Generated src/lib/debate-rules/index.ts from Markdown files');
}

generate();
