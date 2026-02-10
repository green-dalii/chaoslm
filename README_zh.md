# ChaosLM: 多智能体协作与辩论竞技场

ChaosLM 是一个精密的多智能体模拟平台，旨在通过多种大语言模型（LLM）探索多元视角、协作解决问题以及结构化辩论。

## 🌟 核心特性

- **多智能体交互**：编排多个 AI 智能体与人类参与者之间的复杂对话。
- **全方位供应商支持**：无缝集成全球领先的 LLM 供应商：
  - **OpenAI** (GPT-5.3 Codex, GPT-5.2 Thinking, o1)
  - **Anthropic** (Claude 4.6 Opus, Claude 3.5 Sonnet)
  - **Google Gemini** (Gemini 3 Pro/Flash, Gemini 2.5)
  - **DeepSeek** (DeepSeek-V4/V3, DeepSeek-R1 推理支持)
  - **OpenRouter** (集成数百种模型的统一入口)
  - **本地模型**：通过 **Ollama** 运行
  - **国产大模型**：通义千问 (Qwen3-Max/Coder), Kimi (K2.5), Minimax (M2.2), 智谱 (GLM-5)
- **动态辩论模式**：
  - **标准模式 (自由讨论)**：开放式的多视角循环讨论。
  - **经典模式**：正式的结构化辩论（开场 -> 驳论 -> 总结）。
  - **自定义模式**：针对特定需求定制的轮次限制。
- **思维模式**：原生支持 DeepSeek R1 等推理模型，实时展示内部思考过程。
- **会话管理**：支持将辩论历史导出/导入为 JSON 格式，方便分析或稍后继续。
- **极致 UI/UX**：现代响应式界面，支持实时 Token/延迟统计及 Markdown 渲染。

## 🚀 快速上手

### 准备工作
- Node.js 18+
- 对应的供应商 API Key（仅本地存储在您的浏览器中）。

### 安装
```bash
git clone https://github.com/greener-chan/chaoslm.git
cd chaoslm
npm install
```

### 开发模式运行
```bash
npm run dev
```
打开 [http://localhost:3000](http://localhost:3000) 开始您的第一次对话。

## 🏗️ 架构设计

- **前端**：Next.js 14, React, Tailwind CSS, Lucide Icons。
- **状态管理**：Zustand 结合持久化中间件。
- **指挥官核心 (Conductor)**：强大的内部引擎，负责轮次调度、系统提示词注入和 LLM 编排。
- **适配器模式**：可扩展的供应商接口，方便集成新的 AI 模型。

## 📄 许可证
MIT

## 🌍 相关链接
- [更新日志](./.gemini/antigravity/brain/8f53f534-7f9d-4447-82c4-b5907120cfce/changelog.md)
- [English README](./README.md)
