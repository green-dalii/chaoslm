import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/llm-adapters";
import { IMessage } from "@/types";

export const runtime = "nodejs"; // Stability over Edge for local dev

export async function POST(req: NextRequest) {
    console.log("[API] /api/chat hit");
    try {
        const { messages, providerId, modelId, apiKey, systemPrompt, baseURL, temperature } = await req.json();

        if (!providerId || !modelId) {
            return new Response("Missing providerId or modelId", { status: 400 });
        }
        // The 'messages' check is now implicitly handled later if it's truly required by the provider's chatStream.
        // If 'messages' is still a hard requirement before calling the provider, it should be re-added here.
        // For now, following the user's instruction to remove it from this specific check.

        const provider = getProvider(providerId, { baseURL });
        if (!provider) {
            return NextResponse.json(
                { error: `Provider ${providerId} not found` },
                { status: 404 }
            );
        }

        // Use environment variable if apiKey is not provided by client
        const finalApiKey = apiKey || process.env[`${providerId.toUpperCase()}_API_KEY`];

        if (!finalApiKey) {
            return NextResponse.json(
                { error: `Missing API key for provider ${providerId}` },
                { status: 401 }
            );
        }

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                // Track if controller is closed to prevent errors on client disconnect
                let isClosed = false;

                const safeEnqueue = (data: Uint8Array) => {
                    if (!isClosed) {
                        try {
                            controller.enqueue(data);
                        } catch (e) {
                            // Controller closed (client disconnected), mark as closed
                            isClosed = true;
                        }
                    }
                };

                const safeClose = () => {
                    if (!isClosed) {
                        try {
                            controller.close();
                            isClosed = true;
                        } catch (e) {
                            // Already closed, ignore
                        }
                    }
                };

                try {
                    await provider.chatStream(
                        modelId,
                        messages as IMessage[],
                        systemPrompt || "You are a helpful assistant.",
                        finalApiKey,
                        (chunk) => {
                            const payload = `data: ${JSON.stringify(chunk)}\n\n`;
                            safeEnqueue(encoder.encode(payload));
                        },
                        temperature
                    );
                    safeClose();
                } catch (error) {
                    console.error("[API] Streaming error:", error);
                    // Critical: sending error as a chunk to avoid connection drop
                    const errPayload = `data: ${JSON.stringify({ error: String(error) })}\n\n`;
                    safeEnqueue(encoder.encode(errPayload));
                    safeClose();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
