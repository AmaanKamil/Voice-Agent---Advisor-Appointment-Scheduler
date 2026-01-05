"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetellController = void 0;
const axios_1 = __importDefault(require("axios"));
class RetellController {
    static async createWebCall(req, res) {
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
            const response = await axios_1.default.post('https://api.retellai.com/v2/create-web-call', {
                agent_id: agent_id,
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            // Return the access token to the frontend
            res.status(201).json(response.data);
        }
        catch (error) {
            console.error('Retell Create Web Call Error:', error.response?.data || error.message);
            res.status(500).json({ error: 'Failed to create web call', details: error.response?.data || error.message });
        }
    }
}
exports.RetellController = RetellController;
