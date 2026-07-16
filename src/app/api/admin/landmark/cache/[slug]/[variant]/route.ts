import { NextRequest, NextResponse } from 'next/server';

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8891').replace(/\/+$/, '');
const adminHeaders = () => ({
    'X-Admin-Secret': process.env.ADMIN_SECRET ?? '',
    'Content-Type': 'application/json',
});

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string; variant: string }> }
) {
    const { slug, variant } = await params;
    const res = await fetch(`${apiBase}/api/v1/admin/landmarks/cache/${slug}/${variant}`, {
        method: 'DELETE',
        headers: adminHeaders(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
