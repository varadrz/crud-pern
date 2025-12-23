import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const sqlPath = path.join(process.cwd(), 'crud_database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split commands by semicolon to run them sequentially if needed, 
        // but pool.query often executes multiple statements if supported.
        // Let's try executing all at once.
        await query(sql);

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
