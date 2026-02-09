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

## Phase 10: Logic Hardening (Bootstrap & Scheduling) [CURRENT]
- [ ] Fix Bootstrap with System Message Injection (Force AI Context) <!-- id: 36 -->
- [ ] Implement Sequential Turn Scheduler (Include User in Rotation) <!-- id: 37 -->
