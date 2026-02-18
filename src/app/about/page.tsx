"use client";

import { useSettingsStore } from "@/hooks/use-settings-store";
import { Github, Heart } from 'lucide-react';

export default function AboutPage() {
    const { language } = useSettingsStore();

    const content = {
        en: {
            title: "About",
            subtitle: "Orchestrating Multi-Agent Discussion Arenas",
            version: "Version 0.2.0",
            intro1: "ChaosLM is an experimental project designed to explore the emergent dynamics of multi-agent interactions. By placing diverse AI personas in a structured yet open-ended \"arena,\" we can observe how different perspectives collisions, consensus forms, and chaos unfolds.",
            intro2: "Unlike traditional chatbots that serve a single user, ChaosLM acts as a conductor for a symphony of agents. The goal isn't just to get an answer, but to witness the process of deliberation itself.",
            chaosMode: "🎲 Chaos Mode (Free)",
            chaosDesc: "Unbounded discussions where stance and turn order are fluid. Agents react organically to the conversation flow.",
            classicMode: "⚖️ Classic Mode",
            classicDesc: "Structured Pro vs. Con format with specific stages: Opening, Rebuttal, Free Discussion, and Closing.",
            createdBy: "Created by Greener-Dalii",
            tagline: "Building tools to unlock the potential of Agentic AI."
        },
        zh: {
            title: "关于",
            subtitle: "多智能体协作与辩论竞技场",
            version: "版本 0.2.0",
            intro1: "ChaosLM 是一个实验性项目，旨在探索多智能体交互的涌现动力学。通过将不同的 AI 角色置于一个结构化但开放的“竞技场”中，我们可以观察不同观点的碰撞、共识的形成以及混沌的展开。",
            intro2: "与服务单一用户的传统聊天机器人不同，ChaosLM 充当智能体交响乐的指挥家。目标不仅仅是获得一个答案，而是通过观察审议过程本身来获得洞察。",
            chaosMode: "🎲 自由涌现模式 (Chaos Mode)",
            chaosDesc: "无拘束的讨论，立场和轮次都是流动的。智能体对对话流做出有机反应。",
            classicMode: "⚖️ 经典模式",
            classicDesc: "结构化的正反方辩论，包含特定阶段：开场、驳论、自由辩论和总结。",
            createdBy: "由 Greener-Dalii 创建",
            tagline: "构建释放 Agentic AI 潜力的工具。"
        }
    };

    const t = content[language] || content.en;

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pt-20 px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-3xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                        {t.title} <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">ChaosLM</span>
                    </h1>
                    <p className="text-xl text-zinc-500 dark:text-zinc-400">
                        {t.subtitle}
                    </p>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 font-mono">
                        {t.version}
                    </p>
                </div>

                {/* Mission */}
                <section className="prose dark:prose-invert max-w-none">
                    <p className="lead text-lg">
                        {t.intro1}
                    </p>
                    <p>
                        {t.intro2}
                    </p>
                </section>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-bold text-lg mb-2">{t.chaosMode}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {t.chaosDesc}
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-bold text-lg mb-2">{t.classicMode}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {t.classicDesc}
                        </p>
                    </div>
                </div>

                {/* Author Credit */}
                <section className="border-t border-zinc-200 dark:border-zinc-800 pt-10 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-6">
                        <Heart className="w-6 h-6 text-red-500 fill-current animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{t.createdBy}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                        {t.tagline}
                    </p>

                    <div className="flex justify-center gap-4">
                        <a href="https://github.com/greener" target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </section>

            </div>
        </div>
    );
}
