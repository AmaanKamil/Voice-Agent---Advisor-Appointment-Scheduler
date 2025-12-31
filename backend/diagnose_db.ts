
import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

async function diagnose() {
    console.log('--- DB DIAGNOSIS ---');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD Provided:', process.env.DB_PASSWORD ? 'YES (Length: ' + process.env.DB_PASSWORD.length + ')' : 'NO');
    console.log('DB_NAME:', process.env.DB_NAME);

    // 1. Try connecting to MySQL server (no specific DB) to verify Creds
    console.log('\n1. Testing Login Credentials...');
    const rootDb = knex({
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
        }
    });

    try {
        await rootDb.raw('SELECT 1');
        console.log('✅ Credentials Valid!');
    } catch (err: any) {
        console.error('❌ Credentials Failed:', err.message);
        process.exit(1);
    }

    // 2. Check Database Existence
    console.log('\n2. Checking Database Existence...');
    const dbName = process.env.DB_NAME || 'callnest';
    try {
        await rootDb.raw(`CREATE DATABASE IF NOT EXISTS ??`, [dbName]);
        console.log(`✅ Database '${dbName}' ensured.`);
    } catch (err: any) {
        console.error('❌ Failed to create/check database:', err.message);
        process.exit(1);
    }

    await rootDb.destroy();

    // 3. Connect to specific DB and Check Tables
    console.log('\n3. Checking Tables...');
    const appDb = knex({
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: dbName
        }
    });

    try {
        const hasTable = await appDb.schema.hasTable('leads');
        if (hasTable) {
            console.log('✅ Table "leads" exists.');
        } else {
            console.warn('⚠️ Table "leads" MISSING! Attempting to run schema...');
            // Simple schema run
            await appDb.schema.createTable('leads', (table) => {
                table.increments('id');
                table.string('name').notNullable();
                table.string('email').notNullable();
                table.string('mobile').notNullable();
                table.text('message');
                table.timestamp('created_at').defaultTo(appDb.fn.now());
            });
            await appDb.schema.createTable('audit_logs', (table) => {
                table.increments('id');
                table.string('call_id');
                table.string('action').notNullable();
                table.text('details');
                table.timestamp('created_at').defaultTo(appDb.fn.now());
            });
            console.log('✅ Schema created successfully.');
        }
    } catch (err: any) {
        console.error('❌ Table Check Failed:', err.message);
    }

    console.log('\n--- DIAGNOSIS COMPLETE: READY TO START ---');
    process.exit(0);
}

diagnose();
