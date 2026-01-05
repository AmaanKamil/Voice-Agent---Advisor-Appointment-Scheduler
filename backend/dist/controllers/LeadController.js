"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadController = void 0;
const connection_1 = __importDefault(require("../db/connection"));
class LeadController {
    static async createLead(req, res) {
        try {
            const { name, email, mobile, message } = req.body;
            if (!name || !email) {
                return res.status(400).json({ error: 'Name and Email are required' });
            }
            const [id] = await (0, connection_1.default)('leads').insert({
                name,
                email,
                mobile: mobile || 'N/A',
                message: message || ''
            });
            console.log(`New Lead Created: ${id}`);
            // Integrate Audit Log
            await (0, connection_1.default)('audit_logs').insert({
                action: 'LEAD_CREATED',
                details: `Lead ${name} (${email}) requested a quote.`
            });
            res.status(201).json({ success: true, leadId: id });
        }
        catch (error) {
            console.error('Lead Creation Error:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }
}
exports.LeadController = LeadController;
