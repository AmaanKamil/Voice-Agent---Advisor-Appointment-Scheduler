import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const db = knex({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1', // Force TCP connection to avoid socket issues
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'callnest',
    },
    pool: { min: 2, max: 10 },
});

export default db;
