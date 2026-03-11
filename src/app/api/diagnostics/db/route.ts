import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
    const dbUrl = process.env.DATABASE_URL || '';

    // Mask password
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');

    try {
        if (!dbUrl) {
            return NextResponse.json({ status: 'error', message: 'DATABASE_URL is missing in environment variables' }, { status: 500 });
        }

        const isProduction = process.env.NODE_ENV === 'production';
        const sql = postgres(dbUrl, {
            ssl: isProduction ? 'require' : false,
            max: 2,
            idle_timeout: 5
        });

        const result = await sql`SELECT 1 as connected`;

        return NextResponse.json({
            status: 'success',
            masked_url: maskedUrl,
            connection: result[0].connected === 1 ? 'OK' : 'FAILED',
            environment: process.env.NODE_ENV,
            ssl: isProduction ? 'require' : 'false'
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            masked_url: maskedUrl,
            error: error?.message || String(error),
            stack: error?.stack,
            environment: process.env.NODE_ENV
        }, { status: 500 });
    }
}
