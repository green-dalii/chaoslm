import { ChatArena } from "@/components/arena/ChatArena";

export default function ArenaPage() {
    return (
        <div className="flex-1 w-full flex flex-col min-h-0 bg-zinc-50 dark:bg-black overflow-hidden">
            <ChatArena />
        </div>
    );
}
