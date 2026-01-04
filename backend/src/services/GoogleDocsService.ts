import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';

// Ensure env is loaded
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const SCOPES = ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive'];

interface BookingDetails {
    date: string;
    topic: string;
    slot: string;
    booking_code: string;
}

export class GoogleDocsService {
    private static auth() {
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.warn('⚠️  Google Credentials missing. Mocking GoogleDocsService.');
            return null;
        }

        return new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: SCOPES,
        });
    }

    static async appendBooking(details: BookingDetails) {
        console.log(`[GoogleDocs MCP] processing booking ${details.booking_code}...`);

        try {
            const auth = this.auth();
            if (!auth) {
                console.log('[GoogleDocs MCP] MOCK SUCCESS (No creds)');
                return { success: true, mocked: true };
            }

            const docs = google.docs({ version: 'v1', auth });
            const drive = google.drive({ version: 'v3', auth });

            // 1. Find the document "Advisor Pre-Bookings"
            const fileList = await drive.files.list({
                q: "name = 'Advisor Pre-Bookings' and mimeType = 'application/vnd.google-apps.document' and trashed = false",
                fields: 'files(id, name)',
            });

            let docId: string;

            if (fileList.data.files && fileList.data.files.length > 0) {
                docId = fileList.data.files[0].id!;
                console.log(`[GoogleDocs MCP] Found existing doc: ${docId}`);
            } else {
                // Create the doc if it doesn't exist
                const createRes = await docs.documents.create({
                    requestBody: {
                        title: 'Advisor Pre-Bookings',
                    },
                });
                docId = createRes.data.documentId!;
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

        } catch (error: any) {
            console.error('[GoogleDocs MCP] Error:', error.message);
            // We do NOT throw here because this is a side-effect. We return error status.
            return { success: false, error: error.message };
        }
    }
}
