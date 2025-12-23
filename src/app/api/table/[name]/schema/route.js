import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
    const { name } = await params;
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });

    try {
        const result = await query(
            `SELECT column_name, data_type, column_default 
       FROM information_schema.columns 
       WHERE table_name = $1 AND table_schema = 'public'
       ORDER BY ordinal_position`,
            [name]
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
