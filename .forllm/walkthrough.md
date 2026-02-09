# ChaosLM - Walkthrough

**ChaosLM** is a multi-agent debate platform designed with strict "Conductor" orchestration and a professional 3-column interface.

## 1. Features Implemented

### 🧠 The Conductor Core (`src/lib/conductor`)
*   **Turn Scheduler**: Round-robin logic ensures fair debate turns (`scheduler.ts`).
*   **Turn- Added "Stop" button and automatic room activation.
*  - **DeepSeek Reasoner Fix**: Addressed the blank response issue by ensuring `temperature` is not sent to `deepseek-reasoner` (as per specification) while correctly capturing `reasoning_content`.
- **Temperature Control**: Added a slider to the `/setup` page for every agent (and the AI Host), allowing users to adjust model creativity (defaulting to 1.0).
- **Interface Alignment**: Unified the `ILLMProvider` interface across all adapters (Anthropic, Gemini, OpenAI).

## What was tested
- Verified streaming visibility in ChatArena.
- Verified manual regeneration.
- Verified turn-locking on simulated failure.
*   **Bootstrap**: The debate starts automatically with the Host introducing the topic.

## What was tested
*   Verified `/api/chat` stability with `curl` (No more empty replies).
*   Verified `debug-adapters` health.
*   Verified metadata sync to `.forllm`.

### 🔌 Model Management (`src/components/models`)
*   **Multi-Provider Support**: Connect to **OpenAI, Anthropic (Claude), Google Gemini, DeepSeek, Kimi, Minimax, Zhipu**, and **Ollama**.
*   **Custom API Keys**: Securely add your keys. Keys are stored in your browser's LocalStorage.
*   **Custom Base URL**: Override the API endpoint for OpenAI-compatible providers (useful for proxies or local setups).
*   **Dynamic Models**: Fetches usage-ready models from your provider.

### ⚔️ The Arena (`src/components/arena`)
*   **3-Column Layout**:
    1.  **Sessions**: Navigate past debates (visual placeholder).
    2.  **Chat Stream**: Real-time bubbling of messages.
    3.  **HUD**: Live status of all agents (Thinking/Speaking).
*   **Visual Indicators**: See exactly who is speaking and who is up next.

### ⚙️ Setup (`src/components/setup`)
*   **Wizard Flow**:
    1.  **Topic & Role**: Define what to debate and who you are.
    2.  **Agents**: Add "Socrates", "Kant", or "GLaDOS" with specific models.

## 2. How to Run

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

3.  **Usage Flow**
    - **Step 1**: Go to `/setup`.
    - **Step 2**: Configure your Providers in the right-hand panel.
        - **OpenAI/DeepSeek/etc**: Enter API Key.
        - **Ollama**: Ensure it's running (`ollama serve`). default URL is `http://localhost:11434/v1`.
        - **Custom**: Enter Key and your custom `Base URL`.
    - **Step 3**: Enter a Topic and Choose your Role.
    - **Step 4**: Add Agents. Select their specific Model (e.g., `claude-3-opus`, `gemini-1.5-pro`).
    - **Step 5**: Click "Start Debate".
    - **Step 6**: Watch the AI Host kick off the discussion!

## 3. Architecture Highlights

*   **State Management**: `useModelStore` (API Keys) + `useRoomStore` (Game State).
*   **LLM Adapters**: Modular adapter pattern supporting `OpenAI`, `Anthropic`, `Gemini`, and generic OpenAI-compatible endpoints.
*   **UI Framework**: Next.js 16 + TailwindCSS + Framer Motion.
