import { IRoomState, IAgent } from "@/types";

export function getNextTurn(currentState: IRoomState): string | null {
    const { agents, currentTurn, userRole } = currentState;

    if (agents.length === 0) return null;

    // Build the full turn order based on roles
    // Logic: If user is Host or Participant, they are in the rotation?
    // User requested "Regular speaking order".
    // Usually: Moderator -> Pro -> Con -> User -> ... 
    // Or just simple roster order.
    // Let's verify who is 'participant'.

    // We construct a list of IDs.
    let roster: string[] = agents.map(a => a.id);

    // If User is a participant (not observer), add them to the roster.
    // Where? Maybe at the end or beginning?
    // Let's append user at the end for simple round-robin.
    if (userRole !== 'observer') {
        roster.push('user');
    }

    // If no roster, loop? (Shouldn't happen)
    if (roster.length === 0) return null;

    // if no current turn, pick the first one (usually Moderator/Host Agent if sorted that way)
    if (!currentTurn) {
        // If we want Host to start, we should ensure Host is first in 'agents'.
        // The 'agents' array order usually respects creation/setup order.
        return roster[0];
    }

    const currentIndex = roster.indexOf(currentTurn);

    if (currentIndex === -1) {
        // Current speaker not in roster (removed? or observer spoke?)
        // Default to first available
        return roster[0];
    }

    // Strict Round Robin
    const nextIndex = (currentIndex + 1) % roster.length;
    return roster[nextIndex];
}
