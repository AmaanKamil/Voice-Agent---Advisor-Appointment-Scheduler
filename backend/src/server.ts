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

// Allow CORS from anywhere for this demo, or restrict to process.env.FRONTEND_URL for stricter security
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
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
