# Project ChaosLM: Development Principles & Rules

> "Order from Chaos."

This document outlines the First Principles, structural rules, and coding standards for `chaoslm`. All development must adhere to these guidelines to prevent "shit code" (spaghetti code) and ensure long-term maintainability.

## 1. First Principles & Philosophy

### 1.1 The Conductor Pattern
*   **Principle**: The chat room is not a free-for-all. It is an orchestra.
*   **Rule**: We decouple the **Agents** (Intelligence) from the **Flow** (Control). A central `Conductor` module manages turn-taking, permission to speak, and error handling. Agents never "decide" when to speak; they are "invited" to speak.

### 1.2 Context is Scarcity
*   **Principle**: Infinite context does not exist. Token usage implies cost and latency.
*   **Rule**: The system must have a built-in "Garbage Collector" for context. We do not just append messages forever. We implement strict Budgeting (Token Limits) and Compression (Summarization) strategies *before* calls are made.

### 1.3 Agnostic Intelligence
*   **Principle**: The model provider is a detail, not a dependency.
*   **Rule**: The core logic must never know if it's talking to OpenAI or Ollama. All providers must implement a strict `LLMProvider` interface. Use the **Adapter Pattern** strictly. Hardcoding provider-specific logic in the main flow is forbidden.

## 2. Technical Standards

### 2.1 Technology Stack
*   **Language**: TypeScript (Strict Mode). No `any` types allowed without explicit justification.
*   **Runtime**: Node.js (Latest LTS).
*   **Frontend**: Next.js (App Router) for unified full-stack enabling, or React + Vite if separation is cleaner. (Decision: Next.js for ease of deployment and shared types).
*   **Styling**: TailwindCSS (for utility) + Framer Motion (for "design sense" animations).

### 2.2 Modularity & File Structure
*   **Rule**: Maximum file size 200 lines. If it exceeds, refactor.
*   **Colocation**: Things that change together stay together. Feature-based folders preferred over technical layers (e.g., `features/chat/` contains its own components, hooks, and logic).

### 2.3 State Management
*   **Rule**: Single Source of Truth for the Chat State.
*   **Implementation**: Use a robust store (Zustand or Redux Toolkit) to manage the specific state of "Who is speaking", "Stream content", and "Message History". Avoid scattered `useState`.

## 3. The "Anti-Shit-Code" Protocols

1.  **Strict Typing**: Interfaces for everything. `IAgent`, `IMessage`, `IRoomConfig`.
2.  **No Magic Strings**: Use Enums or Constant Objects for all statuses, roles, and event types.
3.  **Error Boundaries**: Every external API call (LLM request) must be wrapped in robust error handling. If a model fails, the show must go on (fallback or skip turn).
4.  **Comments**: Code explains "Start", Comments explain "Why". Complex logic (like the context compression algorithm) must be documented in-place.

## 4. Interaction Design Rules

1.  **Visibility**: The User is the Observer + Participant. Constraints on the UI must ensure the User always knows *current status* (Who is thinking? Who is writing?).
2.  **Debate Integrity**: Implementing a "Lock" mechanism. While `Agent A` is streaming, `Input Box` for others is disabled/queued.

## 5. Maintenance & Tracking

*   **Changelog**: Every significant feature merge requires a strict update to `CHANGELOG.md`.
*   **Todo**: Keep `task.md` updated. Do not rely on mental stack.

## 6. The Aesthetics of Code & Structure (CRITICAL)

> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."

1.  **Zero Bloat Tolerance**:  
    *   Do not add libraries for trivial tasks (e.g., `lodash` for a simple map/filter). 
    *   Do not over-engineer "future-proof" abstractions that aren't needed yet (YAGNI).
    *   If a file exceeds 200 lines, it is likely doing too much. Break it down, but do not fragment it into "dependency hell".

2.  **Structural Elegance**:
    *   **Colocation**: Related logic stays together. Do not scatter a single feature across `actions/`, `reducers/`, `types/`, `services/`, `utils/`. 
    *   **Flat over Nested**: Avoid deep folder nesting (max 3 levels deep).
    *   **Readable > Clever**: Code must be readable like a story. Variable names must be descriptive. "Clever" one-liners that obscure logic are forbidden.

3.  **Visual & Functional Minimalism**:
    *   The UI must be clean, responsive, and free of visual clutter.
    *   Animations must be purposeful, not gratuitous.
    *   "Ugly" code or UI is a bug. Fix it.
