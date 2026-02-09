import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/llm-adapters";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId");
    const apiKey = searchParams.get("apiKey");
    const baseURL = searchParams.get("baseURL") || undefined;

    if (!providerId) {
        return NextResponse.json(
            { error: "Missing providerId" },
            { status: 400 }
        );
    }

    const provider = getProvider(providerId, { baseURL });

    if (!provider) {
        return NextResponse.json(
            { error: `Provider ${providerId} not found` },
            { status: 404 }
        );
    }

    // Use env var fallback
    const finalApiKey = apiKey || process.env[`${providerId.toUpperCase()}_API_KEY`];

    if (!finalApiKey) {
        return NextResponse.json(
            { error: "API Key required" },
            { status: 401 }
        );
    }

    try {
        const models = await provider.listModels(finalApiKey);
        return NextResponse.json({ models });
    } catch (error) {
        console.error("Failed to fetch models:", error);
        return NextResponse.json(
            { error: "Failed to fetch models" },
            { status: 500 }
        );
    }
}
