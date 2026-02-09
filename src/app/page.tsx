import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl text-center sm:text-left">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          ChaosLM
        </h1>
        <p className="text-lg text-gray-400">
          Orchestrate multi-agent debates with precision, strict turn-taking, and efficient context management.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/setup"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Start Session
          </Link>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://github.com/greener/chaoslm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read Documentation
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} ChaosLM Project. All rights reserved.</p>

      </footer>
    </div>
  );
}
