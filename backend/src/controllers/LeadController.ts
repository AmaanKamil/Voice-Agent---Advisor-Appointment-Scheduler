import { Request, Response } from 'express';
import db from '../db/connection';

export class LeadController {
    static async createLead(req: Request, res: Response) {
        try {
            const { name, email, mobile, message } = req.body;

            if (!name || !email) {
                return res.status(400).json({ error: 'Name and Email are required' });
            }

            const [id] = await db('leads').insert({
                name,
                email,
                mobile: mobile || 'N/A',
                message: message || ''
            });

            console.log(`New Lead Created: ${id}`);

            // Integrate Audit Log
            await db('audit_logs').insert({
                action: 'LEAD_CREATED',
                details: `Lead ${name} (${email}) requested a quote.`
            });

            res.status(201).json({ success: true, leadId: id });
        } catch (error: any) {
            console.error('Lead Creation Error:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }
}
