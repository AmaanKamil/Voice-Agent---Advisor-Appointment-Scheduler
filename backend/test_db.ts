
import db from './src/db/connection';

async function testConnection() {
    try {
        console.log('Testing DB connection...');
        await db.raw('SELECT 1');
        console.log('DB Connection successful.');

        console.log('Checking leads table...');
        const exists = await db.schema.hasTable('leads');
        if (exists) {
            console.log('Leads table exists.');
        } else {
            console.error('Leads table DOES NOT exist.');
        }

        process.exit(0);
    } catch (error) {
        console.error('DB Connection Failed:', error);
        process.exit(1);
    }
}

testConnection();
