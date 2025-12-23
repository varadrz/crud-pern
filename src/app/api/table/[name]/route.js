import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
    const { name } = await params; // await params for Next.js 15+

    // Basic validation to prevent SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    try {
        const result = await query(`SELECT * FROM "${name}" ORDER BY id ASC LIMIT 100`);
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    const { name } = await params;
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });

    try {
        const body = await request.json();
        const keys = Object.keys(body);
        const values = Object.values(body);

        if (keys.length === 0) return NextResponse.json({ error: 'No data' }, { status: 400 });

        const cols = keys.map(k => `"${k}"`).join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const result = await query(
            `INSERT INTO "${name}" (${cols}) VALUES (${placeholders}) RETURNING *`,
            values
        );
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
