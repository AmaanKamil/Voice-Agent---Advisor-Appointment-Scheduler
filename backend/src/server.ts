import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load ENV first, before other imports use process.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import bodyParser from 'body-parser';
import { WebhookController } from './controllers/WebhookController';
import { LeadController } from './controllers/LeadController';
import { RetellController } from './controllers/RetellController';

const app = express();
const port = process.env.PORT || 3001;

// CORS Configuration
const allowedOrigins = (process.env.FRONTEND_URL || '*').split(',').map(url => url.trim().replace(/\/$/, ''));
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if allowed
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
            callback(null, true);
        } else {
            console.log(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Routes
app.post('/api/webhook/retell', WebhookController.handleRetellWebhook);
app.post('/api/leads', LeadController.createLead);
app.post('/api/create-web-call', RetellController.createWebCall);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`CallNest Backend running on port ${port}`);
});
