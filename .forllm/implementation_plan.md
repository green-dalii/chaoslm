# Implementation Plan - Fixes for UI, Setup, and Scheduler

This plan addresses 6 specific issues reported by the user, ranging from UI layout bugs to critical scheduler logic faults.

## User Review Required

> [!IMPORTANT]
> **Issue #6 (Scheduler Skip)**: The identified cause is that the `useConductor` hook was calculating the *next* turn's schedule and passing it as the *current task instruction* to the active agent. This caused agents to receive instructions like "Next speaker is [Someone Else]", leading to confusion or yielding of turns. The fix involves removing this automatic instruction injection for the standard discussion loop.

> [!IMPORTANT]
> **Issue #4 (Chaos Terminology)**: Standard Mode/Chaos Mode terminology will be strictly updated to "Discussion/Exploration" instead of "Debate" to align with the user's philosophy.

## Proposed Changes

### [Component] Setup Screen and UI
#### [MODIFY] [SetupScreen.tsx](file:///Users/greener/project/chaoslm/src/components/setup/SetupScreen.tsx)
- **Fix Issue #1 (Navbar Occlusion)**: Add top padding (`pt-20` or similar) to the main container to account for the fixed Navbar.
- **Fix Issue #2 (UI Refactor)**: Redesign Step 1 card layout to be more compact. Use Grid layout for Topic, Description, and Mode selection to reduce vertical scrolling.
- **Fix Issue #3 (Duplicate Host Config)**: Remove the "AI Host Configuration" block from Step 2 (Agents list), as it is already present in Step 1.
- **Fix Issue #4 (Terminology)**: Update UI labels for "Standard Mode" to avoid words like "Debate" (use "Discussion", "Session", "Chaos / Free Mode").

### [Logic] Debate Rules & Prompts
#### [MODIFY] [src/lib/debate-rules/index.ts](file:///Users/greener/project/chaoslm/src/lib/debate-rules/index.ts)
- **Fix Issue #4**: Rewrite `standardRules` description to emphasize "Discussion" and "Exploration" over "Debate". Ensure terminology "Chaos / Free Mode" is used.
- **Fix Issue #5**: Refine `generateAIHostOpeningPrompt` and `generateChaosLMOpeningPrompt` to ensure instructions are clear and don't lead to leakage. Ensure `bootstrapContext` is correctly passed and contains the specific topic info.

### [Logic] Conductor & Scheduler
#### [MODIFY] [src/hooks/use-conductor.ts](file:///Users/greener/project/chaoslm/src/hooks/use-conductor.ts)
- **Fix Issue #6 (Scheduler Skip)**: In the main `useEffect` loop that triggers `runTurn`, STOP passing `schedule.instruction` as the `overridePrompt` for standard turns. The agent should simply continue the flow based on history unless a specific intervention is needed.
- **Fix Issue #5 (Prompt Leaking & Static Content)**: 
    - In `runTurn`, improve `enhancedSystemPrompt` construction. If `overridePrompt` looks like a public system announcement (starts with `[SYSTEM]`), do NOT append it to the `[CURRENT TASK]` section of the system prompt.
    - **Crucial Fix**: Verify that `runBootstrapPhase` is correctly regenerating context for *new* topics. The issue of "fixed content" suggests the bootstrap context might be stale or not being utilized in the prompt generation. We will ensure `bootstrapContext` is fresh.

#### [MODIFY] [src/lib/conductor/scheduler.ts](file:///Users/greener/project/chaoslm/src/lib/conductor/scheduler.ts)
- **Review**: Ensure `OPENING_AI_HOST` instructions contain the dynamic `bootstrapContext`.

## Verification Plan

### Manual Verification
1. **(Issue 1 & 2)**: Open `/setup`. Verify Navbar doesn't overlap content. Check that Step 1 layout is compact and clean.
2. **(Issue 3)**: Go to Step 2. Verify "AI Host Configuration" is NOT visible (when user is normal participant).
3. **(Issue 4)**: Check descriptions for Chaos Mode. Should say "Discussion/Exploration", not "Debate".
4. **(Issue 5)**: Start a new session with AI Host. Check the first message. It should be a proper welcome speech, NOT starting with `[OPENING_AI_HOST]: You are...` and MUST be relevant to the specific topic.
5. **(Issue 6)**: Start a session.
   - Flow: ChaosLM (hidden/intro) -> Host Opening -> **Participant 1** -> Participant 2.
   - Verify Participant 1 is NOT skipped.
