import { Pool } from 'pg';

let pool;

if (!pool) {
    const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : process.env.DATABASE_URL;
    pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });
}

export const query = (text, params) => pool.query(text, params);
