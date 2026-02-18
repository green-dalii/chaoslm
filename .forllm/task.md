# ChaosLM - Task List

<!-- id: task-list -->

## Phase 1: Planning & Design [COMPLETED]
- [x] Create Project Principles & Rules (`project_rules.md`) <!-- id: 0 -->
- [x] Create Implementation Plan & Architecture (`implementation_plan.md`) <!-- id: 1 -->
- [x] Initialize Changelog (`changelog.md`) <!-- id: 2 -->
- [x] User Review of Planning Documents <!-- id: 3 -->

## Phase 2: Foundation Setup [COMPLETED]
- [x] Initialize Git Repository & Project Structure <!-- id: 4 -->
- [x] Set up Monorepo or Unified Structure (Backend/Frontend) <!-- id: 5 -->
- [x] Configure Linting, Formatting (ESLint, Prettier), and TypeScript <!-- id: 6 -->

## Phase 3: Core Backend (The Conductor) [COMPLETED]
- [x] Implement LLM Provider Interface (Adapter Pattern) <!-- id: 7 -->
- [x] Implement Dynamic Model Fetching <!-- id: 8 -->
- [x] Create Room & Session Management <!-- id: 9 -->
- [x] Implement Turn-Taking / Debate Logic (The Scheduler) <!-- id: 10 -->
- [x] Build Context Management System (Compression/Summary) <!-- id: 11 -->

## Phase 4: Frontend Implementation (The Arena) [COMPLETED]
- [x] Setup UI Framework (React/Next.js + Tailwind/CSS Modules) <!-- id: 12 -->
- [x] Implement Chat Room Interface <!-- id: 13 -->
- [x] Create Agent Configuration & Persona UI <!-- id: 14 -->
- [x] Implement Visual Feedback for "Thinking" states <!-- id: 15 -->

## Phase 5: Polish & Testing [COMPLETED]
- [x] Integration Testing of Multi-Agent Interaction <!-- id: 16 -->
- [x] UI/UX Polish (Animations, Theming) <!-- id: 17 -->
- [ ] Final Review & Documentation <!-- id: 18 -->

## Phase 6: Iteration 2 - UX Overhaul & Model Management [COMPLETED]
- [x] Design & Implement Model Management (Provider/Key Setup) <!-- id: 19 -->
- [x] Refactor Room Setup (Topic, User Role, Agent Model Selection) <!-- id: 20 -->
- [x] Implement AI Host Bootstrap Logic <!-- id: 21 -->
- [x] Overhaul Chat Arena UI (3-Column Layout: Sessions | Chat | Participants) <!-- id: 22 -->
- [x] Implement Visual Turn Indicators in Participant List <!-- id: 23 -->

## Phase 7: Comprehensive Model Provider Support [COMPLETED]
- [x] Refactor `OpenAIAdapter` to `GenericOpenAIAdapter` (Support DeepSeek, Kimi, Minimax, Zhipu, Ollama) <!-- id: 24 -->
- [x] Implement `AnthropicAdapter` <!-- id: 25 -->
- [x] Implement `GeminiAdapter` <!-- id: 26 -->
- [x] Update `ModelManager` to support Provider selection and Base URL configuration <!-- id: 27 -->
- [x] Update `useModelStore` with default provider list <!-- id: 28 -->

## Phase 8: UX Refinement & Logic Fixes [COMPLETED]
- [x] Refactor `ModelManager` to use Dropdown & Card UI with Auto-fill Base URLs <!-- id: 29 -->
- [x] Fix `SetupScreen` validation (prevent adding agent without model) <!-- id: 30 -->
- [x] Implement AI Host Model Selection in Setup <!-- id: 31 -->
- [x] Verify Base URLs for Asian Providers <!-- id: 32 -->

## Phase 9: Final Polish & extended Support [CURRENT]
- [x] Fix "Unknown" Sender (Handle System messages) <!-- id: 41 -->
- [x] Enhance AI Host Bootstrap Prompt (Rich Context) <!-- id: 42 -->
- [x] Add Session Delete/Reset Button to Sidebar <!-- id: 43 -->

## Phase 13: Stability & Advanced Features [CURRENT]
- [/] Fix API Crash (Switch to Node.js Runtime & Debug Empty Response) <!-- id: 44 -->
- [x] Implement Thinking Mode (Capture & Display Reasoning) <!-- id: 45 -->
- [x] Fix DeepSeek Reasoner "Blank" Issue (Strip think tags) <!-- id: 48 -->
- [x] Add Temperature Slider to Setup UI <!-- id: 49 -->
- [x] Implement "End Debate" Button & Moderator Summary <!-- id: 50 -->
- [ ] Fix Empty Avatar Bug <!-- id: 46 -->
- [ ] Reinforce Conductor State Logic <!-- id: 47 -->

## Phase 14: Advanced Debate Modes & Scheduling [COMPLETED]
- [x] Update IRoomState with Modes & Rounds <!-- id: 51 -->
- [x] Implement Multi-Mode Scheduler Logic <!-- id: 52 -->
- [x] Implement System-Signal based Conductor Flow <!-- id: 53 -->
- [x] Add Mode Selection to SetupScreen <!-- id: 54 -->
- [x] Refine "End Debate" Button & UI Interaction <!-- id: 55 -->
- [x] Implement Failure Retries & Friendly Errors <!-- id: 56 -->

## Phase 15: Conductor & UI Bug Fixes [COMPLETED]
- [x] Fix Moderator-first turn logic <!-- id: 57 -->
- [x] Improve stream processing (fix "Thinking" output hang) <!-- id: 58 -->
- [x] Enhance "End Debate" button visibility & icon <!-- id: 59 -->
- [x] Document scheduling logic in `/.forllm/scheduling_logic.md` <!-- id: 60 -->

## Phase 16: UI Stats, Model Info & Advanced Bootstrap [COMPLETED]
- [x] Add Token & Time statistics to message bubbles <!-- id: 61 -->
- [x] Display model info in Participant List <!-- id: 62 -->
- [x] Fix "End Debate" button visibility once and for all <!-- id: 63 -->
- [x] Implement two-step System Bootstrap (Context -> Injection -> Speaker) <!-- id: 64 -->

## Phase 17: DeepSeek R1 & Logic Hardening [COMPLETED]
- [x] Fix DeepSeek Reasoner multi-round hangs (Correct Role Mapping: Perspectively convert others to User) <!-- id: 65 -->
- [x] Inject Debate Mode Rules into System Bootstrap prompt <!-- id: 66 -->
- [x] Add UI descriptions for Debate Modes in Setup Screen <!-- id: 67 -->
- [x] Implement empty content detection in Conductor to prevent infinite loops <!-- id: 68 -->

## Phase 18: Markdown & UX Polish [COMPLETED]
- [x] Implement Markdown rendering for message bubbles <!-- id: 69 -->
- [x] Use agent names instead of IDs in System instructions <!-- id: 70 -->
- [x] Fix "End Debate" logic (ensure moderator summary triggers) <!-- id: 71 -->
- [x] Refine Setup Screen: Default model name if empty, prevent adding without model, empty provider default <!-- id: 72 -->

## Phase 19: Setup Refactor & Standard Mode Redefined [COMPLETED]
- [x] Phase 19: Setup Refactor & Standard Mode Redefined
    - [x] Streamline `SetupScreen.tsx` (collapsible temperature, field reordering)
    - [x] Implement Stance Selection (Pro/Con/Neutral) for Classic/Custom modes
    - [x] Redefine "Standard" mode as an open-ended multi-perspective discussion
    - [x] Auto-generate personas based on stance and topic
    - [x] Update Scheduler to support stances

## Phase 20: New Providers & Scheduler Hardening [COMPLETED]
- [x] Integrate OpenRouter & Qwen (add default models) <!-- id: 79 -->
- [x] Rename "Start Debate" to "开始讨论" <!-- id: 80 -->
- [x] Fix "Standard" mode scheduling loop (ensure moderator intro and fix participant skip) <!-- id: 81 -->
- [x] Fix Provider persistence sync (merge default providers with local storage) <!-- id: 82 -->

## Phase 21: Session Import/Export & Global Documentation [COMPLETED]
- [x] Implement `importRoom` in room store <!-- id: 83 -->
- [x] Add Import/Export buttons to ChatArena UI <!-- id: 84 -->
- [x] Implement JSON export/import logic <!-- id: 85 -->
- [x] Update README.md and create README_zh.md <!-- id: 86 -->
- [x] Final Git Commit <!-- id: 87 -->

## Phase 22: 2026 Model Information Update [COMPLETED]
- [x] Research latest Feb 2026 model IDs <!-- id: 88 -->
- [x] Update README.md and README_zh.md with new models <!-- id: 89 -->
- [x] Synchronize default models in LLM adapters <!-- id: 90 -->
- [x] Verify final build <!-- id: 91 -->

## Phase 23: UI Optimization & Multi-language Support [COMPLETED]
- [x] Implement `use-settings-store` for i18n <!-- id: 92 -->
- [x] Create global `Navbar` component <!-- id: 93 -->
- [x] Add language switcher to Navbar <!-- id: 94 -->
- [x] Update homepage with Arena entry point <!-- id: 95 -->
- [x] Finalize UI localization (English/Chinese) <!-- id: 96 -->

## Phase 27: Architectural Split & Theme Fixes [COMPLETED]
- [x] Split Room Setup and AI Provider Settings into distinct pages (`/setup` and `/settings`) <!-- id: 111 -->
- [x] Fix broken theme switcher (switch from media queries to class-based toggling) <!-- id: 112 -->
- [x] Implement multi-session management in `use-room-store.ts` (resolve overwriting/carry-over issues) <!-- id: 113 -->
- [x] Overhaul `ModelManager.tsx` UI for consistent readability across themes <!-- id: 114 -->
- [x] Conduct visual audit and polish all UI elements <!-- id: 115 -->

## Phase 28: UX Refinements & Layout Fixes [COMPLETED]
- [x] Restore Session Export functionality in Arena sidebar <!-- id: 116 -->
- [x] Fix Setup screen layout (element overlap & scrolling) <!-- id: 117 -->
- [x] Move Model Configuration link to Navbar <!-- id: 118 -->
- [x] Verify all navigation paths <!-- id: 119 -->

## Phase 30: Critical Session Fixes [COMPLETED]
- [x] Fix session deletion logic (prevent unnecessary switches) <!-- id: 123 -->
- [x] Fix `SetupScreen` state reset on new session <!-- id: 124 -->
- [x] Improve "End Discussion" logic and moderator prompt <!-- id: 125 -->
- [x] Fix UI flickering in Arena sidebar <!-- id: 126 -->
- [x] Final verification and synchronization to `.forllm/` <!-- id: 127 -->

## Phase 32: UI Refinement & Setup Optimization [COMPLETED]
- [x] Rename "SYSTEM" role to "ChaosLM" in ChatArena <!-- id: 133 -->
- [x] Move "Start Discussion" button to Live Preview in SetupScreen <!-- id: 134 -->
- [x] Add "at least one agent" validation to Start button <!-- id: 135 -->
- [x] Final verification and sync to `.forllm/` <!-- id: 136 -->

## Phase 33: Input UX & Member Management Enhancement [COMPLETED]
- [x] Enable input box for all user roles (observer can join anytime) <!-- id: 137 -->
- [x] Disable send button during AI turns (wait for user turn) <!-- id: 138 -->
- [x] Add detailed description field in setup (optional instructions) <!-- id: 139 -->
- [x] Update member name placeholder with auto-dedup logic <!-- id: 140 -->
- [x] Fix setup screen layout - move member list to Live Preview sidebar <!-- id: 141 -->
- [x] Sync changes to `.forllm/` <!-- id: 142 -->

## Phase 34: System Model Configuration & Bootstrap Fixes [COMPLETED]
- [x] Add ChaosLM system model configuration to settings store <!-- id: 143 -->
- [x] Create system model config UI in /settings page <!-- id: 144 -->
- [x] Add model configuration check on homepage with alert dialog <!-- id: 145 -->
- [x] Move AI Host config to Step 1 in SetupScreen when user is not host <!-- id: 146 -->
- [x] Auto-fill AI Host config from systemModel <!-- id: 147 -->
- [x] Fix internal scheduling instructions showing in chat ([OPENING_AI_HOST]) <!-- id: 148 -->
- [x] Sync changes to `.forllm/` <!-- id: 149 -->

## Phase 30.1: Post-Release Fixes [COMPLETED]
- [x] Fix `SetupScreen` step loop (reset on ID only) <!-- id: 128 -->
- [x] Refactor sidebar deletion to stable state-based UI <!-- id: 129 -->
- [x] Refactor "End Discussion" to state-based UI & harden flow <!-- id: 130 -->
- [x] Verify session reset and synchronization <!-- id: 131 -->
- [x] Final verification and documentation <!-- id: 132 -->

## Phase 29: Meta-file Synchronization [COMPLETED]
- [x] Add synchronization rule to `.forllm/project_rules.md` <!-- id: 120 -->
- [x] Synchronize `task.md`, `walkthrough.md`, `implementation_plan.md`, `changelog.md` to `.forllm/` <!-- id: 121 -->
- [x] Establish permanent synchronization protocol <!-- id: 122 -->

## Phase 26: Refining UI Layout & Theme Switcher [COMPLETED]
- [x] Implement theme switcher in `Navbar.tsx` and `use-settings-store.ts` <!-- id: 106 -->
- [x] Fix Navbar alignment (remove `max-w-7xl`, adjust padding) <!-- id: 107 -->
- [x] Resolve Setup screen layout overlap with Navbar <!-- id: 108 -->
- [x] Polish `ModelManager.tsx` theme consistency and spacing <!-- id: 109 -->
- [x] Conduct general theme visibility audit (text/elements) <!-- id: 110 -->

## Changelog Entry:
- [x] Phase 26: Refining UI Layout & Theme Switcher
    - [x] Implement theme switcher in `Navbar.tsx` and `use-settings-store.ts`
    - [x] Fix Navbar alignment (remove `max-w-7xl`, adjust padding)
    - [x] Resolve Setup screen layout overlap with Navbar
    - [x] Polish `ModelManager.tsx` theme consistency and spacing
    - [x] Conduct general theme visibility audit (text/elements)

## Phase 35: Fixes for Reported Issues [CURRENT]
- [x] Fix Navbar occlusion in SetupScreen (`/setup` layout) <!-- id: 150 -->
- [x] Refactor Room Setup UI (Compact Step 1, Grid layout) <!-- id: 151 -->
- [x] Remove duplicate AI Host config in Step 2 <!-- id: 152 -->
- [x] Update Terminology: "Debate" -> "Discussion" in Standard Mode <!-- id: 153 -->
- [x] Fix ChaosLM opening prompt leakage (`[OPENING_AI_HOST]`) <!-- id: 154 -->
- [x] Fix Scheduler skipping first participant (remove auto-instruction) <!-- id: 155 -->
- [x] Fix Setup duplicate Topic Input & Layout Optimizations <!-- id: 156 -->
- [x] Fix Recursive Scheduler Skip (Explicit Mod->P1 transition) <!-- id: 157 -->
- [x] Fix Prompt Tag Leakage (Strip internal tags) <!-- id: 158 -->

