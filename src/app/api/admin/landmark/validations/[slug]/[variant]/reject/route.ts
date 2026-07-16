import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? '';
const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8891').replace(/\/+$/, '');

function guardAdmin(req: NextRequest): boolean {
    const token = req.headers.get('x-admin-token') ?? '';
    return token !== '' && token === ADMIN_SECRET;
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string; variant: string }> }
) {
    if (!guardAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { slug, variant } = await params;
    const body = await req.json();
    const res = await fetch(`${apiBase}/api/v1/admin/landmarks/validations/${slug}/${variant}/reject`, {
        method: 'PUT',
        headers: { 'X-Admin-Secret': ADMIN_SECRET, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
