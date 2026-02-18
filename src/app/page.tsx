"use client";

import Link from "next/link";
import { useSettingsStore, translations } from "@/hooks/use-settings-store";
import { useModelStore } from "@/hooks/use-model-store";
import { useRoomStore } from "@/hooks/use-room-store";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, AlertCircle, Settings } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { language, isSystemModelConfigured } = useSettingsStore();
  const { providers } = useModelStore();
  const { createNewSession } = useRoomStore();
  const router = useRouter();
  const t = translations[language].home;

  const [showAlert, setShowAlert] = useState(false);

  // Check if any provider is configured with API key
  const hasConfiguredProvider = providers.some(p => p.apiKey && p.enabled);
  const hasSystemModel = isSystemModelConfigured();

  const handleStartNew = () => {
    // Check prerequisites
    if (!hasConfiguredProvider || !hasSystemModel) {
      setShowAlert(true);
      return;
    }

    createNewSession();
    window.location.href = "/setup";
  };

  const navigateToSettings = () => {
    router.push("/settings");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 font-sans">
      {/* Alert Banner */}
      {showAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {language === 'zh' ? '需要配置' : 'Configuration Required'}
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              {!hasConfiguredProvider && (
                <div className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>
                    {language === 'zh'
                      ? '尚未配置任何模型提供商的 API 密钥'
                      : 'No model provider API key configured'}
                  </span>
                </div>
              )}
              {!hasSystemModel && (
                <div className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>
                    {language === 'zh'
                      ? '尚未配置 ChaosLM 系统模型'
                      : 'ChaosLM system model not configured'}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-zinc-500 mb-6">
              {language === 'zh'
                ? '在开始新会话之前，请先完成以下配置：'
                : 'Please complete the following configurations before starting a new session:'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAlert(false)}
                className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={navigateToSettings}
                className="flex-1 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {language === 'zh' ? '前往设置' : 'Go to Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex flex-col gap-10 items-center max-w-3xl text-center">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 px-4 py-2">
            {t.title}
          </h1>
          <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Configuration Status Indicator */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${hasConfiguredProvider
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            }`}>
            {hasConfiguredProvider ? '✓' : '!'}
            {language === 'zh' ? '模型提供商' : 'Model Provider'}
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${hasSystemModel
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            }`}>
            {hasSystemModel ? '✓' : '!'}
            {language === 'zh' ? '系统模型' : 'System Model'}
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row w-full sm:w-auto">
          <button
            onClick={handleStartNew}
            className="w-full sm:w-auto group relative flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 h-12 sm:h-14 px-8 rounded-2xl font-bold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-500/20"
          >
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            {t.start}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <Link
            href="/arena"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 h-12 sm:h-14 px-8 rounded-2xl font-bold text-base sm:text-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {t.enterArena}
          </Link>
        </div>

        {/* Hint for configuration */}
        {(!hasConfiguredProvider || !hasSystemModel) && (
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {language === 'zh'
              ? '点击"开始新会话"前请先完成配置'
              : 'Please complete configuration before starting'}
          </p>
        )}
      </main>

      <footer className="mt-20 flex items-center justify-center text-xs text-zinc-400 font-medium tracking-wider">
        <p>© {new Date().getFullYear()} Greener-Dalii. ChaosLM All rights reserved.</p>
      </footer>
    </div>
  );
}
