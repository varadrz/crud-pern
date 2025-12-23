import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request, { params }) {
    const { name, id } = await params;
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });

    try {
        const body = await request.json();
        const keys = Object.keys(body);
        const values = Object.values(body);

        if (keys.length === 0) return NextResponse.json({ error: 'No data' }, { status: 400 });

        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');

        // Add id to values for WHERE clause
        values.push(id);

        const result = await query(
            `UPDATE "${name}" SET ${setClause} WHERE id = $${values.length} RETURNING *`,
            values
        );

        if (result.rowCount === 0) return NextResponse.json({ error: 'Row not found' }, { status: 404 });
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { name, id } = await params;
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });

    try {
        const result = await query(
            `DELETE FROM "${name}" WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rowCount === 0) return NextResponse.json({ error: 'Row not found' }, { status: 404 });
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
