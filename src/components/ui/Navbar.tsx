"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettingsStore, translations } from "@/hooks/use-settings-store";
import { LayoutDashboard, Swords, Settings, Github, Languages, Zap, Sun, Moon, Info, FileJson } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
    const pathname = usePathname();
    const { language, setLanguage, theme, setTheme } = useSettingsStore();
    const t = translations[language].nav;
    const commonT = translations[language].setup; // For Models & Providers label

    const navItems = [
        { name: t.home, href: "/", icon: LayoutDashboard },
        { name: t.arena, href: "/arena", icon: Swords },
        { name: "Showcase", href: "/showcase", icon: FileJson }, // Consider adding translation later
        { name: t.setup, href: "/setup", icon: Settings },
        { name: language === 'zh' ? '模型与插件' : 'Models & Providers', href: "/settings", icon: Zap },
        { name: language === 'zh' ? '关于' : 'About', href: "/about", icon: Info },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shrink-0">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-14 items-center">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="p-1.5 bg-zinc-900 dark:bg-white rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-zinc-500/20">
                                <Zap className="w-4 h-4 text-white dark:text-zinc-900 fill-current" />
                            </div>
                            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                                ChaosLM
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors rounded-lg ${isActive
                                            ? "text-zinc-900 dark:text-white"
                                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-active"
                                                className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 -z-10 rounded-lg"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-inner">
                            <button
                                onClick={() => setLanguage(language === "en" ? "zh" : "en")}
                                className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 rounded-md transition-all flex items-center gap-2"
                                title="Switch Language"
                            >
                                <Languages className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">{language}</span>
                            </button>

                            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 rounded-md transition-all flex items-center justify-center"
                                title={t.toggleTheme}
                            >
                                {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                            </button>
                        </div>

                        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

                        <a
                            href="https://github.com/greener/chaoslm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
