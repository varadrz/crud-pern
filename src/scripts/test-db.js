const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '..', '.env');
const fileExists = fs.existsSync(envPath);
console.log('Env file exists:', fileExists, 'at', envPath);
if (fileExists) {
    console.log('File content preview:', fs.readFileSync(envPath, 'utf8').substring(0, 20) + '...');
}
console.log('Loading .env via dotenv...');
dotenv.config({ path: envPath });

const dbUrl = process.env.DATABASE_URL;
console.log('Testing connection to:', dbUrl ? dbUrl.replace(/:[^:@]+@/, ':***@') : 'UNDEFINED');
console.log('Testing connection to:', dbUrl ? dbUrl.replace(/:[^:@]+@/, ':***@') : 'UNDEFINED');

if (!dbUrl) {
    console.error('DATABASE_URL is missing in', envPath);
    process.exit(1);
}

// Clean URL logic same as app
const connectionString = dbUrl.split('?')[0];
console.log('Cleaned Connection String:', connectionString.replace(/:[^:@]+@/, ':***@'));

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

(async () => {
    try {
        console.log('Connecting...');
        const res = await pool.query('SELECT current_database()');
        console.log('Connected to database:', res.rows[0].current_database);

        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map(r => r.table_name));
    } catch (err) {
        console.error('Connection Failed:', err);
    } finally {
        await pool.end();
    }
})();
