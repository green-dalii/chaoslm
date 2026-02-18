import { SetupScreen } from "@/components/setup/SetupScreen";

export default function SetupPage() {
    return (
        <div className="h-full flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-black">
            <SetupScreen />
        </div>
    );
}
