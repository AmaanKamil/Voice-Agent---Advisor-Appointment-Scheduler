import { Request, Response } from 'express';
import axios from 'axios';

export class RetellController {
    static async createWebCall(req: Request, res: Response) {
        try {
            const { agent_id } = req.body;
            const apiKey = process.env.RETELL_API_KEY;

            if (!apiKey) {
                return res.status(500).json({ error: 'RETELL_API_KEY not configured in backend' });
            }

            if (!agent_id) {
                return res.status(400).json({ error: 'agent_id is required' });
            }

            // Call Retell API to register the call
            const response = await axios.post(
                'https://api.retellai.com/v2/create-web-call',
                {
                    agent_id: agent_id,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Return the access token to the frontend
            res.status(201).json(response.data);

        } catch (error: any) {
            console.error('Retell Create Web Call Error:', error.response?.data || error.message);
            res.status(500).json({ error: 'Failed to create web call', details: error.response?.data || error.message });
        }
    }
}
