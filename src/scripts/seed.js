const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Explicitly load .env.local from project root
const envPath = path.resolve(__dirname, '..', '..', '.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env.local:', result.error);
}

const dbUrl = process.env.DATABASE_URL;
console.log('Env Path:', envPath);
console.log('DATABASE_URL defined:', !!dbUrl);
if (dbUrl) {
    console.log('Connecting to:', dbUrl.replace(/:[^:@]+@/, ':***@'));
} else {
    console.error('DATABASE_URL is missing!');
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl && dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function seed() {
    try {
        if (!dbUrl) throw new Error('DATABASE_URL is missing');

        const sqlPath = path.join(__dirname, '..', '..', 'crud_database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL script...');
        await pool.query(sql);
        console.log('Database seeded successfully.');
    } catch (err) {
        console.error('Error seeding database:', err);
        fs.writeFileSync('seed_error.log', err.toString() + '\n' + err.stack);
    } finally {
        await pool.end();
    }
}

seed();
