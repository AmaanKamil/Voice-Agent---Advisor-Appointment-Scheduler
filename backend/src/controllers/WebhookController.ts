import { Request, Response } from 'express';
import { GroqService } from '../services/GroqService';
import { IntentRouter } from '../services/IntentRouter';
import db from '../db/connection';

export class WebhookController {
    static async handleRetellWebhook(req: Request, res: Response) {
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
            await db('call_sessions').insert({
                call_id: call_id || `unknown-${Date.now()}`,
                agent_id: agent_id,
                recording_url: recording_url,
                summary: summary
            }).onConflict('call_id').ignore(); // Prevent crash on duplicate webhooks

            // 2. Infer Intent
            const inference = await GroqService.inferIntent(summary);
            console.log('Inferred Intent:', inference);

            // 3. Store Inference
            await db('inferred_intents').insert({
                call_id: call_id || `unknown-${Date.now()}`,
                intent: inference.intent,
                confidence_score: inference.confidence,
                entities: JSON.stringify(inference.entities),
                raw_response: JSON.stringify(inference)
            });

            // 4. Route to Action
            const executionResult = await IntentRouter.route(call_id || `unknown-${Date.now()}`, inference);

            res.status(200).json({ received: true, intent: inference.intent, result: executionResult });
        } catch (error) {
            console.error('Webhook Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
