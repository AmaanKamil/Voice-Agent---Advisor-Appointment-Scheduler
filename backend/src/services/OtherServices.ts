import db from '../db/connection';
import { InferredData } from './GroqService';

export class RescheduleService {
    static async handle(call_id: string, data: InferredData) {
        console.log('--- Handling Reschedule ---');
        // Logic: Find booking by code (if provided) or fuzzy match client name
        // For now, just log and return success
        await db('audit_logs').insert({
            call_id,
            action: 'RESCHEDULE_REQUESTED',
            details: JSON.stringify(data.entities)
        });
        return { message: 'Reschedule request received. An agent will contact you.' };
    }
}

export class CancelService {
    static async handle(call_id: string, data: InferredData) {
        console.log('--- Handling Cancellation ---');
        await db('audit_logs').insert({
            call_id,
            action: 'CANCEL_REQUESTED',
            details: JSON.stringify(data.entities)
        });
        return { message: 'Cancellation processed.' };
    }
}
