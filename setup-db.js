const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    try {
      const envPath = path.join(__dirname, '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL\s*=\s*([^\r\n]+)/);
        if (match) {
          connectionString = match[1].trim();
        }
      }
    } catch (e) {
      console.warn('Could not read .env file directly:', e);
    }
  }
  
  if (!connectionString) {
    connectionString = 'postgresql://postgres:1234@localhost:5432/crm_db';
  }

  console.log(`Connecting to database: ${connectionString.replace(/:([^@]+)@/, ':****@')}`);
  const client = new Client({
    connectionString: connectionString,
    ssl: connectionString.includes('supabase.co') || connectionString.includes('render.com') || process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    const sqlPath = path.join(__dirname, 'schema.sql');
    console.log(`Reading SQL schema file from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL schema (tables + seeds)...');
    await client.query(sql);
    console.log('SQL schema executed successfully! Database tables and seeds have been initialized.');
  } catch (err) {
    console.error('Error executing database setup:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
