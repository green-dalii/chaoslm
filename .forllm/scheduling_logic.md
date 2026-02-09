# Scheduling Logic Design

This document outlines the intended scheduling logic for the ChaosLM debate simulation, ensuring a logical flow from start to finish.

## Core Principles
1.  **Moderator First**: Every debate must start with a Moderator introduction if a Moderator is present and history is empty.
2.  **System Signals**: The Scheduler generates `[SYSTEM]` instructions that guide the Moderator on what to do next.
3.  **Mode-Specific Transitions**:
    - **Standard**: Moderator Intro -> Loop(Participants + User)
    - **Custom**: Moderator Intro -> Loop(Participants) limited by `maxRounds` -> Moderator Summary
    - **Classic**: Moderator Intro -> Pro Opening -> Con Opening -> Pro Rebuttal -> Con Rebuttal -> Free Debate -> Pro Summary -> Con Summary -> Moderator Conclusion

## Logic Flow (Pseudo-code)

### 1. Initialization (History is Empty)
- **Target**: Moderator
- **Instruction**: "[SYSTEM]: Topic: {{topic}}. Moderator, please introduce the topic and the participants."
- **Action**: Set `currentStage` to `introduction` (if in Classic).

### 2. Standard Mode
- If `currentTurn` is null or Moderator just finished intro:
    - **Target**: First Participant
    - **Instruction**: "[SYSTEM]: Opening floor. {{participant_name}} is speaking next."
- Else:
    - **Target**: Next in roster (Participants + optional User)
    - **Instruction**: "[SYSTEM]: Next speaker: {{next_name}}."

### 3. Custom Mode
- Similar to Standard, but track `currentRound`.
- When all participants have spoken in a round, increment `currentRound`.
- If `currentRound > maxRounds`:
    - **Target**: Moderator
    - **Instruction**: "[SYSTEM]: Max rounds reached. Moderator, please summarize and conclude."

### 4. Classic Mode (Fixed Stages)
Follow the order:
1. `introduction` (Moderator)
2. `pro_opening` (Pro Agent)
3. `con_opening` (Con Agent)
4. `pro_rebuttal` (Pro)
5. `con_rebuttal` (Con)
6. `free` (Moderator facilitates / all participate)
7. `pro_summary` (Pro)
8. `con_summary` (Con)
9. `conclusion` (Moderator)

## Error Handling & Manual End
- **`isEnding` flag**: If set (via End Debate button), immediately jump to:
    - **Target**: Moderator
    - **Instruction**: "[SYSTEM]: Manual termination triggered. Moderator, please provide a final summary."

## State Management
- `currentRound` and `currentStage` must be updated *before* the turn starts so the system prompt can be enriched with current status.
