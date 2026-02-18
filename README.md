# ChaosLM

[English](./README.md) | [中文](./README_zh.md)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong>Multi-Agent Collaboration & Debate Arena</strong><br>
  Explore diverse perspectives, collaborative problem-solving, and structured debate through the power of Large Language Models.
</p>

---

## Features

### 🤖 Multi-Agent Collaboration
- Orchestrate complex discussions between multiple AI agents and human participants
- Support for various user roles: Observer, Participant, and Host/Moderator
- @Mention mechanism to directly call specific participants

### 🔌 Multi-Provider Support
Seamlessly integrate with world-leading LLM providers:

| Provider | Models | Notes |
|----------|--------|-------|
| **OpenAI** | GPT-5, o3, o4 | Official API |
| **Anthropic** | Claude 4.6 Opus, Claude 4.5 Sonnet | Dedicated adapter |
| **Google Gemini** | Gemini 3.5 Pro/Flash | Dedicated adapter |
| **DeepSeek** | DeepSeek-V4, DeepSeek-R2 | Supports reasoning models |
| **Qwen** | Qwen3.5-Max, Qwen3.5-Coder | Alibaba's flagship models |
| **Kimi** | Kimi-k2.5 | Moonshot AI |
| **MiniMax** | MiniMax-M2.5 | |
| **Zhipu AI** | GLM-5, GLM-4 | |
| **Ollama** | Llama4, Mistral | Local models |
| **OpenRouter** | 100+ models | Unified gateway |

### ⚔️ Dynamic Debate Modes
- **Chaos Mode**: Open-ended, multi-perspective discussion loop
- **Classic Mode**: Formal structured debate (Opening → Rebuttal → Summary)
- **Custom Mode**: Round-limited turns tailored for specific requirements

### 🧠 Thinking Mode
- Native support for reasoning models (DeepSeek R1, etc.)
- Display internal chain of thought in real-time

### 💾 Data Management
- Export/Import sessions as JSON files
- Session replay in Showcase area
- All data stored locally in browser (localStorage)

---

## Quick Start

### Prerequisites

- Node.js 18+
- API keys for your preferred LLM providers

### Installation

```bash
# Clone the repository
git clone https://github.com/green-dalii/chaoslm.git
cd chaoslm

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use

### 1. Configure Providers
Navigate to **Settings** and add your AI providers with API keys.

### 2. Set System Model
Choose a default model for generating bootstrap content and system prompts.

### 3. Create a Session
1. Go to **Setup** page
2. Enter your discussion topic
3. Select debate mode (Chaos/Classic/Custom)
4. Choose your role (Observer/Participant/Host)
5. Add AI agents with specific stances and descriptions

### 4. Enter the Arena
Watch or participate in the debate!

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │   Home   │  │  Arena   │  │  Setup   │  │Settings │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Management                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Room Store  │  │ Model Store │  │Settings Store│   │
│  │   (Zustand) │  │  (Zustand)  │  │  (Zustand)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Conductor Engine                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Scheduler (Turn Management)           │   │
│  │  Bootstrap → Opening → Discussion → Summary       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      LLM Adapters                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │  OpenAI  │  │ Anthropic│  │  Gemini  │  │Custom │ │
│  │ Adapter  │  │ Adapter  │  │ Adapter  │  │Adapter│ │
│  └──────────┘  └──────────┘  └──────────┘  └───────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| `ChatArena` | Core debate interface with real-time streaming |
| `Conductor` | Orchestrates multi-agent discussions and turn-taking |
| `Scheduler` | Manages debate flow: Bootstrap → Opening → Discussion |
| `LLM Adapters` | Extensible adapter pattern for multi-provider support |

---

## Security

- **API Keys**: Stored only in your browser's localStorage, never uploaded to any server
- **Session Data**: All data remains local, with export/import support

---

## Deployment

ChaosLM supports multiple deployment platforms:

### Local Development
```bash
npm run dev
```

### Vercel (Recommended)
Connect your GitHub repository to Vercel for automatic deployments.

### Cloudflare Pages

ChaosLM is configured for Cloudflare Pages deployment using the OpenNext adapter.

**Build Configuration:**
- Build command: `npx @opennextjs/cloudflare`
- Output directory: `.open-next`

Or deploy manually:
```bash
# Install dependencies
npm install

# Build for Cloudflare
npx @opennextjs/cloudflare

# Deploy using Wrangler
npx wrangler deploy
```

For more details, see the [OpenNext Cloudflare adapter documentation](https://opennext.js.org/cloudflare).

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with:

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [React Icons](https://react-icons.github.io/react-icons/)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/green-dalii">green-dalii</a>
</p>
