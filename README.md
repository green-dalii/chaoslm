# ChaosLM: The Multi-Agent Collaboration & Debate Arena

ChaosLM is a sophisticated multi-agent simulation platform designed to explore diverse perspectives, collaborative problem-solving, and structured debate through the power of various Large Language Models (LLMs).

![ChaosLM Banner](https://raw.githubusercontent.com/greener-chan/chaoslm/main/public/banner.png) *(Note: Placeholder for actual banner)*

## 🌟 Key Features

- **Multi-Agent Interaction**: Orchestrate complex discussions between multiple AI agents and human participants.
- **Multi-Provider Support**: Seamlessly integrate with world-leading LLM providers:
  - **OpenAI** (GPT-4o, GPT-3.5-Turbo)
  - **Anthropic** (Claude 3.5 Sonnet, Opus)
  - **Google Gemini** (Gemini 1.5 Pro/Flash)
  - **DeepSeek** (DeepSeek-V3, DeepSeek-R1 with reasoning support)
  - **OpenRouter** (Unified access to hundreds of models)
  - **Local Models** via **Ollama**
  - **Asian Providers**: Qwen (Alibaba), Kimi (Moonshot), Minimax, Zhipu
- **Dynamic Debate Modes**:
  - **Standard (Free)**: Open-ended, multi-perspective discussion loop.
  - **Classic**: Formal structured debate (Opening -> Rebuttal -> Summary).
  - **Custom**: Round-limited turns tailored for specific requirements.
- **Thinking Mode**: Native support for DeepSeek R1 and other "reasoning" models to display the internal chain of thought.
- **Session Management**: Export and Import your debate history as JSON for analysis or later resumption.
- **Rich UI/UX**: Modern, responsive interface with real-time token/latency metrics and markdown rendering.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- API Keys for your preferred providers (stored locally in your browser).

### Installation
```bash
git clone https://github.com/greener-chan/chaoslm.git
cd chaoslm
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start your first session.

## 🏗️ Architecture

- **Frontend**: Next.js 14, React, Tailwind CSS, Lucide Icons.
- **State Management**: Zustand with persistent middleware.
- **Conductor Core**: A robust internal engine (The Conductor) that manages turn scheduling, system prompt injection, and LLM orchestration.
- **Adapter Pattern**: Extensible provider interface for easy integration of new AI models.

## 📄 License
MIT

## 🌍 Links
- [Changelog](./.gemini/antigravity/brain/8f53f534-7f9d-4447-82c4-b5907120cfce/changelog.md)
- [中文文档 (README_zh.md)](./README_zh.md)
