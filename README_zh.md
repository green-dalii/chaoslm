# ChaosLM

[English](./README.md) | [中文](./README_zh.md)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong>多智能体协作与辩论竞技场</strong><br>
  通过大语言模型的力量，探索多元视角、协作解决问题和结构化辩论。
</p>

---

## 特性

### 🤖 多智能体协作
- 编排多个 AI 智能体与人类参与者之间的复杂讨论
- 支持多种用户角色：观察者、参与者和主持人/Moderator
- @提及机制，直接调用特定参与者

### 🔌 多供应商支持
无缝集成全球领先的 LLM 供应商：

| 供应商 | 模型 | 备注 |
|----------|--------|-------|
| **OpenAI** | GPT-5, o3, o4 | 官方 API |
| **Anthropic** | Claude 4.6 Opus, Claude 4.5 Sonnet | 专用适配器 |
| **Google Gemini** | Gemini 3.5 Pro/Flash | 专用适配器 |
| **DeepSeek** | DeepSeek-V4, DeepSeek-R2 | 支持推理模型 |
| **Qwen** | Qwen3.5-Max, Qwen3.5-Coder | 阿里旗舰模型 |
| **Kimi** | Kimi-k2.5 | Moonshot AI |
| **MiniMax** | MiniMax-M2.5 | |
| **Zhipu AI** | GLM-5, GLM-4 | |
| **Ollama** | Llama4, Mistral | 本地模型 |
| **OpenRouter** | 100+ 模型 | 统一网关 |

### ⚔️ 动态辩论模式
- **自由模式**：开放式的多视角循环讨论
- **经典模式**：正式的结构化辩论（开场 → 驳论 → 总结）
- **自定义模式**：针对特定需求定制的轮次限制

### 🧠 思维模式
- 原生支持推理模型（DeepSeek R1 等）
- 实时展示内部思考过程

### 💾 数据管理
- 将会话导出/导入为 JSON 文件
- 在展示区回放会话
- 所有数据本地存储在浏览器中（localStorage）

---

## 快速开始

### 前置条件

- Node.js 18+
- 您首选 LLM 供应商的 API 密钥

### 安装

```bash
# 克隆仓库
git clone https://github.com/greener-chan/chaoslm.git
cd chaoslm

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

---

## 使用方法

### 1. 配置供应商
导航到 **Settings** 添加您的 AI 供应商和 API 密钥。

### 2. 设置系统模型
选择用于生成引导内容和系统提示的默认模型。

### 3. 创建会话
1. 进入 **Setup** 页面
2. 输入您的讨论主题
3. 选择辩论模式（Chaos/Classic/Custom）
4. 选择您的角色（观察者/参与者/主持人）
5. 添加具有特定立场和描述的 AI 智能体

### 4. 进入竞技场
观看或参与辩论！

---

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │   首页   │  │  竞技场  │  │   设置   │  │  配置  │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      状态管理                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  房间状态    │  │  模型状态    │  │ 设置状态    │   │
│  │  (Zustand) │  │  (Zustand)  │  │  (Zustand)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      指挥官引擎                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │              调度器（轮次管理）                     │   │
│  │  引导 → 开场 → 讨论 → 总结                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      LLM 适配器                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │  OpenAI │  │ Anthropic│  │  Gemini  │  │ 自定义 │ │
│  │  适配器  │  │  适配器  │  │  适配器  │  │ 适配器 │ │
│  └──────────┘  └──────────┘  └──────────┘  └───────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 描述 |
|-----------|-------------|
| `ChatArena` | 带有实时流式传输的核心辩论界面 |
| `Conductor` | 编排多智能体讨论和轮次分配 |
| `Scheduler` | 管理辩论流程：引导 → 开场 → 讨论 |
| `LLM 适配器` | 可扩展的适配器模式，支持多供应商 |

---

## 安全

- **API 密钥**：仅存储在浏览器的 localStorage 中，绝不上传至任何服务器
- **会话数据**：所有数据保留在本地，支持导出/导入

---

## 贡献

欢迎提交 Pull Request！

---

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)。

---

## 致谢

基于以下技术构建：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [React Icons](https://react-icons.github.io/react-icons/)

---

<p align="center">
  由 <a href="https://github.com/greener">Greener</a> 用 ❤️ 构建
</p>
