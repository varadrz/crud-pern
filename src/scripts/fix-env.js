const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '..', '.env');
const content = "DATABASE_URL=postgresql://neondb_owner:npg_9cywbYS4UCJm@ep-divine-darkness-a1z9aw69-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require\n";

fs.writeFileSync(envPath, content, { encoding: 'utf8' });
console.log('Clean .env written to', envPath);
