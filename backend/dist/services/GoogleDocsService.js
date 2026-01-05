"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDocsService = void 0;
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Ensure env is loaded
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const SCOPES = ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive'];
class GoogleDocsService {
    static auth() {
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.warn('⚠️  Google Credentials missing. Mocking GoogleDocsService.');
            return null;
        }
        return new googleapis_1.google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: SCOPES,
        });
    }
    static async appendBooking(details) {
        console.log(`[GoogleDocs MCP] processing booking ${details.booking_code}...`);
        try {
            const auth = this.auth();
            if (!auth) {
                console.log('[GoogleDocs MCP] MOCK SUCCESS (No creds)');
                return { success: true, mocked: true };
            }
            const docs = googleapis_1.google.docs({ version: 'v1', auth });
            const drive = googleapis_1.google.drive({ version: 'v3', auth });
            // 1. Find the document "Advisor Pre-Bookings"
            const fileList = await drive.files.list({
                q: "name = 'Advisor Pre-Bookings' and mimeType = 'application/vnd.google-apps.document' and trashed = false",
                fields: 'files(id, name)',
            });
            let docId;
            if (fileList.data.files && fileList.data.files.length > 0) {
                docId = fileList.data.files[0].id;
                console.log(`[GoogleDocs MCP] Found existing doc: ${docId}`);
            }
            else {
                // Create the doc if it doesn't exist
                const createRes = await docs.documents.create({
                    requestBody: {
                        title: 'Advisor Pre-Bookings',
                    },
                });
                docId = createRes.data.documentId;
                console.log(`[GoogleDocs MCP] Created new doc: ${docId}`);
            }
            // 2. Append Content
            const textToAppend = `
------------------------------------------------
Booking Code: ${details.booking_code}
Date: ${details.date}
Slot: ${details.slot}
Topic: ${details.topic}
Created At: ${new Date().toISOString()}
------------------------------------------------
`;
            await docs.documents.batchUpdate({
                documentId: docId,
                requestBody: {
                    requests: [
                        {
                            insertText: {
                                endOfSegmentLocation: {}, // Append to end
                                text: textToAppend,
                            },
                        },
                    ],
                },
            });
            console.log(`[GoogleDocs MCP] Successfully appended booking ${details.booking_code}`);
            return { success: true, docId };
        }
        catch (error) {
            console.error('[GoogleDocs MCP] Error:', error.message);
            // We do NOT throw here because this is a side-effect. We return error status.
            return { success: false, error: error.message };
        }
    }
}
exports.GoogleDocsService = GoogleDocsService;
