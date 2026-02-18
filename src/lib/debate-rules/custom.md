# 自定义轮次模式 / Custom Rounds Mode

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

```
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
```

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

Participants can use `@MemberName` within their turns:
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
