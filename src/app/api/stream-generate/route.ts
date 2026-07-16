import { NextRequest } from 'next/server';

const GO_API = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:8889';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') ?? '';

    const goResponse = await fetch(`${GO_API}/api/v1/trips/generate/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
    });

    if (!goResponse.ok || !goResponse.body) {
        const errText = await goResponse.text();
        return new Response(errText, { status: goResponse.status });
    }

    // Pass-through SSE stream from Go → client
    return new Response(goResponse.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
