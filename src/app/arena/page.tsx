import { ChatArena } from "@/components/arena/ChatArena";

export default function ArenaPage() {
    return (
        <div className="h-full w-full flex flex-col bg-zinc-50 dark:bg-black overflow-hidden">
            <ChatArena />
        </div>
    );
}
