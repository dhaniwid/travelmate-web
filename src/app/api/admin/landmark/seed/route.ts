import { NextRequest, NextResponse } from 'next/server';

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8891').replace(/\/+$/, '');
const adminHeaders = () => ({
    'X-Admin-Secret': process.env.ADMIN_SECRET ?? '',
    'Content-Type': 'application/json',
});

export async function POST(req: NextRequest) {
    const body = await req.json();
    const res = await fetch(`${apiBase}/api/v1/admin/landmarks/seed`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
