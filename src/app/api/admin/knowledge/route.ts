import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

const GO_API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8889/api/v1').replace(/\/+$/, '');
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? '';
const ADMIN_EMAILS = ['dhaniwid@gmail.com', 'admin@miru.travel', 'widodo.apple@gmail.com'];

async function guardAdmin(): Promise<boolean> {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    return !!email && ADMIN_EMAILS.includes(email);
}

// POST /api/admin/knowledge → proxy to Go POST /admin/knowledge
export async function POST(req: NextRequest) {
    if (!await guardAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const res = await fetch(`${GO_API}/admin/knowledge`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-Secret': ADMIN_SECRET,
        },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
