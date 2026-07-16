import { NextRequest, NextResponse } from 'next/server';

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8891').replace(/\/+$/, '');
const adminHeaders = () => ({
    'X-Admin-Secret': process.env.ADMIN_SECRET ?? '',
    'Content-Type': 'application/json',
});

export async function GET() {
    const res = await fetch(`${apiBase}/api/v1/admin/landmarks/configs`, {
        headers: adminHeaders(),
        cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: NextRequest) {
    const slug = req.nextUrl.searchParams.get('slug');
    if (!slug) {
        return NextResponse.json({ code: 'invalid_params', message: 'slug wajib diisi' }, { status: 400 });
    }
    const body = await req.json();
    const res = await fetch(`${apiBase}/api/v1/admin/landmarks/configs/${slug}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
