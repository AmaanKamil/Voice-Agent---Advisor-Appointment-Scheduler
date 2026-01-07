
import db from '../db/connection';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verifySystem() {
    console.log('🔍 Starting System Verification...');
    console.log('--------------------------------');

    // 1. Check Database Connection
    try {
        console.log(`📡 Connecting to Database at ${process.env.DB_HOST}...`);
        await db.raw('SELECT 1');
        console.log('✅ Database Connection: SUCCESS');
    } catch (error: any) {
        console.error('❌ Database Connection: FAILED');
        console.error('   Error:', error.message);
        console.error('   Hint: Check DB_HOST, DB_USER, DB_PASSWORD in .env');
        process.exit(1);
    }

    // 2. Verify Tables
    const requiredTables = [
        'leads',
        'call_sessions',
        'inferred_intents',
        'bookings',
        'calendar_events',
        'audit_logs'
    ];

    try {
        console.log('\n📊 Verifying Schema...');
        // Generic query to show tables, works on MySQL
        const [rows] = await db.raw('SHOW TABLES');
        // rows is an array of RowDataPacket, e.g. [{ Tables_in_callnest: 'audit_logs' }, ...]

        // Extract table names safely
        const existingTables = rows.map((r: any) => Object.values(r)[0]);

        let missing = [];
        for (const table of requiredTables) {
            if (existingTables.includes(table)) {
                console.log(`   - Table '${table}': FOUND`);
            } else {
                console.log(`   - Table '${table}': ❌ MISSING`);
                missing.push(table);
            }
        }

        if (missing.length > 0) {
            console.error('\n❌ Critical: Missing tables in database!');
            console.error('   Please run the database_migration.md script again.');
            process.exit(1);
        }
        console.log('✅ Schema Verification: SUCCESS');

    } catch (error: any) {
        console.error('❌ Table Verification Failed:', error.message);
        process.exit(1);
    }

    // 3. Test Write Permission (Audit Log)
    try {
        console.log('\n📝 Testing Write Access...');
        await db('audit_logs').insert({
            action: 'SYSTEM_VERIFICATION',
            details: 'Automated deployment check passed.',
            call_id: 'test_check'
        });
        console.log('✅ Write Access (Audit Log): SUCCESS');
    } catch (error: any) {
        console.error('❌ Write Access Failed:', error.message);
        console.error('   Hint: Check user permissions for INSERT.');
        process.exit(1);
    }

    console.log('\n--------------------------------');
    console.log('🚀 SYSTEM READY FOR PRODUCTION');
    console.log('--------------------------------');
    process.exit(0);
}

verifySystem();
