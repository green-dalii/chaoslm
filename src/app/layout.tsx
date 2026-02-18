"use client";

import { useSettingsStore } from "@/hooks/use-settings-store";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine dynamic theme class
  const themeClass = mounted ? (theme === 'system' ? '' : theme) : '';

  return (
    <html lang="en" className={themeClass}>
      <body
        className="antialiased bg-background text-foreground font-sans h-screen overflow-hidden flex flex-col"
      >
        <Navbar />
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
