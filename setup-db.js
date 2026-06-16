const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const connectionString = 'postgresql://postgres:Nexion%40%232026@db.ijxjdmofwzrvfeceyimh.supabase.co:5432/postgres';
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
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
