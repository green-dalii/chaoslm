# 经典辩论模式 / Classic Debate Mode

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

During Free Debate phase, participants can use `@MemberName` for direct engagement:
- Example: "@ProSpeaker You claimed X, but evidence shows Y..."
- Use for direct questions and targeted rebuttals
- Moderator can use @mentions to direct speaking turns

## Winning Criteria / 评判标准

While Classic debate doesn't have automated "winners", evaluation considers:
- **Argument Strength / 论证力度**: Logic, evidence, coherence
- **Rebuttal Effectiveness / 反驳效果**: Addressing opponent's points
- **Adherence to Rules / 规则遵守**: Following structure and token limits
- **Presentation / 表达质量**: Clarity, organization, persuasiveness
