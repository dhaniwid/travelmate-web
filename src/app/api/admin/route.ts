import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

const GO_API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8889/api/v1').replace(/\/+$/, '');
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? '';
const ADMIN_EMAILS = ['dhaniwid@gmail.com', 'admin@miru.travel', 'widodo.apple@gmail.com'];

// Guard: verify Clerk session and admin email whitelist — token never passed from client
async function guardAdmin(): Promise<boolean> {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    return !!email && ADMIN_EMAILS.includes(email);
}

// GET /api/admin?search=... → proxy to Go GET /admin/users
export async function GET(req: NextRequest) {
    if (!await guardAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const search = req.nextUrl.searchParams.get('search') ?? '';
    const url = `${GO_API}/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`;

    const res = await fetch(url, { headers: { 'X-Admin-Secret': ADMIN_SECRET }, cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

// POST /api/admin  body: { userId, tier, duration_days }
export async function POST(req: NextRequest) {
    if (!await guardAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, tier, duration_days } = await req.json();
    if (!userId || !tier) return NextResponse.json({ error: 'userId and tier required' }, { status: 400 });

    const res = await fetch(`${GO_API}/admin/users/${userId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': ADMIN_SECRET },
        body: JSON.stringify({ tier, duration_days: duration_days ?? 0 }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
