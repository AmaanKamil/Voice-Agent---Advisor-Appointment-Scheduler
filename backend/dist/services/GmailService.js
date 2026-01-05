"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailService = void 0;
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];
class GmailService {
    static auth() {
        // 1. Try Personal OAuth2 (Refresh Token Strategy)
        if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN) {
            console.log('[Gmail MCP] Using Personal OAuth2 Credentials');
            const oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
            oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
            return oAuth2Client;
        }
        // 2. Try Workspace Service Account
        if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            console.log('[Gmail MCP] Using Service Account Credentials');
            return new googleapis_1.google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                },
                scopes: SCOPES,
            });
        }
        console.warn('⚠️  Google Credentials missing. Mocking GmailService.');
        return null;
    }
    static makeBody(to, subject, message) {
        const str = [
            `To: ${to}`,
            'Content-Type: text/plain; charset="UTF-8"',
            'MIME-Version: 1.0',
            `Subject: ${subject}`,
            '',
            message,
        ].join('\n');
        return Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
    static async createDraft(details) {
        console.log(`[Gmail MCP] Creating draft for ${details.to}...`);
        try {
            const auth = this.auth();
            if (!auth) {
                console.log('[Gmail MCP] MOCK SUCCESS (No creds)');
                return { success: true, mocked: true };
            }
            // Note: Service Accounts act on their own behalf unless delegated (Domain-Wide Delegation).
            // If the user wants to draft on behalf of an advisor, we need 'subject' delegation.
            // For now, we assume simple service account usage or that the SA itself is the sender.
            // If delegation is needed, the GoogleAuth config allows `clientOptions: { subject: 'user@domain.com' }`.
            // We'll trust the base configuration for now.
            const gmail = googleapis_1.google.gmail({ version: 'v1', auth });
            const raw = this.makeBody(details.to, details.subject, details.body);
            const res = await gmail.users.drafts.create({
                userId: 'me',
                requestBody: {
                    message: {
                        raw,
                    },
                },
            });
            console.log(`[Gmail MCP] Draft created! ID: ${res.data.id}`);
            return { success: true, id: res.data.id };
        }
        catch (error) {
            if (error.message?.includes('Precondition check failed')) {
                console.warn('[Gmail MCP] ⚠️  Creation Skipped: Personal Gmail accounts cannot handle Service Account drafts. Use Workspace for this feature.');
                return { success: false, error: 'SKIPPED_PERSONAL_ACCOUNT_LIMITATION' };
            }
            console.error('[Gmail MCP] Error:', error.message);
            return { success: false, error: error.message };
        }
    }
}
exports.GmailService = GmailService;
