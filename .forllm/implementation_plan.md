# Advanced Debate Modes & Robust Scheduling

Enhance the debate experience with specialized modes, a signal-based scheduler, and robust error handling.

## User Review Required

> [!IMPORTANT]
> **Host Dependency**: The "Classic" and "Custom" modes rely heavily on the AI Host to manage the flow. Ensure the AI Host model is reliable (e.g., GPT-4o or Claude 3.5 Sonnet).

## Proposed Changes

### Core Types & State
#### [MODIFY] [types/index.ts](file:///Users/greener/project/chaoslm/src/types/index.ts)
- Add `DebateMode`: `standard`, `classic`, `custom`.
- Add `IRoomState` fields: `debateMode`, `maxRounds`, `currentRound`, `currentStage`, `isEnding`.

#### [MODIFY] [use-room-store.ts](file:///Users/greener/project/chaoslm/src/hooks/use-room-store.ts)
- Add actions for setting the mode and round configuration.
- Implement state updates for tracking rounds and stages.

---

### Centralized Scheduler
#### [MODIFY] [scheduler.ts](file:///Users/greener/project/chaoslm/src/lib/conductor/scheduler.ts)
- Implement `getScheduleInstruction(state: IRoomState)`:
    - Returns `{ targetId, instruction, nextStage? }`.
    - **Standard**: Circular participant loop.
    - **Classic**: Sequence of `introduction` -> `opening` -> `rebuttal` -> `free` -> `conclusion`.
    - **Custom**: Stops after `maxRounds` is reached.
- The instruction will be formatted as a System message to guide the Moderator.

---

### Conductor Integration
#### [MODIFY] [use-conductor.ts](file:///Users/greener/project/chaoslm/src/hooks/use-conductor.ts)
- Implement **Signal-Based Flow**:
    1. Scheduler emits instruction.
    2. Conductor posts System message.
    3. Moderator (AI Host) responds to the System message.
    4. Target participant responds to the Moderator.
- Implement **Failure Handling**:
    - Max 3 retries for model errors.
    - Pause and notify user with a "Friendly Error" on persistent failure.
- Fix **End Debate**:
    - Distinct button logic.
    - `stop()` all streams -> Set `isEnding: true` -> Trigger Moderator summary.

---

### UI Enhancements
#### [MODIFY] [SetupScreen.tsx](file:///Users/greener/project/chaoslm/src/components/setup/SetupScreen.tsx)
- Add "Debate Mode" selector in Step 1.
- Add "Rounds" input if "Custom" mode is selected.

#### [MODIFY] [ChatArena.tsx](file:///Users/greener/project/chaoslm/src/components/arena/ChatArena.tsx)
- Add the permanent "End Debate" button.
- Improve status display (show current round/stage).

## Verification Plan

### Manual Verification
1. **Rounds**: Set rounds to 2 in Custom mode, verify it stops and summarizes.
2. **Classic**: Verify progression through stages.
3. **Failure**: Intentionally provide a wrong API key to test the "Restart Speaker" and "Friendly Error" logic.
4. **End Button**: Click mid-generation and verify immediate stop + summary.
