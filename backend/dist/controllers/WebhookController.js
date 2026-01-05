"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const GroqService_1 = require("../services/GroqService");
const IntentRouter_1 = require("../services/IntentRouter");
const connection_1 = __importDefault(require("../db/connection"));
class WebhookController {
    static async handleRetellWebhook(req, res) {
        try {
            // Retell payload structure: { call_id, agent_id, recording_url, transcript, call_analysis: { call_summary, ... } }
            // Actual payload might vary, assuming 'call_analysis.call_summary' or top level 'summary' based on Retell docs.
            // For this demo, let's look for call_summary in body.
            const { call_id, agent_id, recording_url, call_analysis } = req.body;
            const summary = call_analysis?.call_summary || req.body.summary;
            console.log(`Received Webhook for Call ${call_id}`);
            if (!summary) {
                console.warn('No summary found in webhook payload');
                res.status(400).json({ message: 'No summary provided' });
                return;
            }
            // 1. Store Call Session
            await (0, connection_1.default)('call_sessions').insert({
                call_id: call_id || `unknown-${Date.now()}`,
                agent_id: agent_id,
                recording_url: recording_url,
                summary: summary
            }).onConflict('call_id').ignore(); // Prevent crash on duplicate webhooks
            // 2. Infer Intent
            const inference = await GroqService_1.GroqService.inferIntent(summary);
            console.log('Inferred Intent:', inference);
            // 3. Store Inference
            await (0, connection_1.default)('inferred_intents').insert({
                call_id: call_id || `unknown-${Date.now()}`,
                intent: inference.intent,
                confidence_score: inference.confidence,
                entities: JSON.stringify(inference.entities),
                raw_response: JSON.stringify(inference)
            });
            // 4. Route to Action
            const executionResult = await IntentRouter_1.IntentRouter.route(call_id || `unknown-${Date.now()}`, inference);
            res.status(200).json({ received: true, intent: inference.intent, result: executionResult });
        }
        catch (error) {
            console.error('Webhook Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
exports.WebhookController = WebhookController;
