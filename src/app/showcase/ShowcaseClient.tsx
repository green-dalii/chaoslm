"use client";

import { useRoomStore } from "@/hooks/use-room-store";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

export function ShowcaseClient({ sessionData }: { sessionData: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { importRoom, setActiveSession } = useRoomStore();
    const router = useRouter();

    const handlePlay = () => {
        if (!sessionData) return;

        // Import the session into the store
        // We might want to generate a new ID to avoid conflicts if imported multiple times, 
        // but for now let's trust the importRoom logic or the user to manage duplicates.
        // Actually, let's regenerate the ID to treat it as a fresh import/copy.
        const sessionToImport = {
            ...sessionData,
            id: crypto.randomUUID(), // Always new ID for showcase imports
            topic: `${sessionData.topic} (Replay)`,
            importedAt: new Date().toISOString()
        };

        importRoom(sessionToImport);
        setActiveSession(sessionToImport.id);
        router.push('/arena');
    };

    return (
        <button
            onClick={handlePlay}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-lg shadow-zinc-500/10"
        >
            <Play className="w-4 h-4 fill-current" />
            <span>Replay</span>
        </button>
    );
}
