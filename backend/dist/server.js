"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load ENV first, before other imports use process.env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const body_parser_1 = __importDefault(require("body-parser"));
const WebhookController_1 = require("./controllers/WebhookController");
const LeadController_1 = require("./controllers/LeadController");
const RetellController_1 = require("./controllers/RetellController");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Allow CORS from anywhere for this demo, or restrict to process.env.FRONTEND_URL for stricter security
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(body_parser_1.default.json());
// Routes
app.post('/api/webhook/retell', WebhookController_1.WebhookController.handleRetellWebhook);
app.post('/api/leads', LeadController_1.LeadController.createLead);
app.post('/api/create-web-call', RetellController_1.RetellController.createWebCall);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(port, () => {
    console.log(`CallNest Backend running on port ${port}`);
});
