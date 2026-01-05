"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarService = void 0;
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
// Calendar API Scope
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
class GoogleCalendarService {
    static auth() {
        // 1. Try Personal OAuth2 (Refresh Token Strategy)
        if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN) {
            const oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
            oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
            return oAuth2Client;
        }
        console.warn('⚠️  Calendar Credentials missing. Mocking CalendarService.');
        return null;
    }
    static async createTentativeHold(details) {
        console.log(`[Calendar MCP] Creating hold for ${details.booking_code}...`);
        try {
            const auth = this.auth();
            if (!auth) {
                console.log('[Calendar MCP] MOCK SUCCESS (No creds)');
                return { success: true, mocked: true };
            }
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth });
            // Construct DateTime string in ISO format
            // details.date = "2025-01-01", details.start_time = "10:00:00"
            // We need 2025-01-01T10:00:00
            // Basic parsing helper
            const getDateISO = (d, t) => {
                const datePart = d.includes('T') ? d.split('T')[0] : d;
                // Remove AM/PM if present just in case, but assume input is cleaner or rely on Date
                const fullStr = `${datePart} ${t}`;
                const dateObj = new Date(fullStr);
                if (isNaN(dateObj.getTime()))
                    return new Date(); // Fallback
                return dateObj;
            };
            const startDateTime = getDateISO(details.date, details.start_time);
            // Calculate End Time (30 mins duration default if end_time not parsed well, OR use provided end_time)
            let endDateTime = getDateISO(details.date, details.end_time);
            if (endDateTime <= startDateTime) {
                // specific logic: add 30 mins
                endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
            }
            const event = {
                summary: `Advisor Q&A — ${details.topic} — ${details.booking_code}`,
                description: `Topic: ${details.topic}\nBooking Code: ${details.booking_code}\nNote: This is a tentative hold based on a voice agent booking.\nTimezone: ${details.timezone}`,
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: 'Asia/Kolkata', // Hardcoded IST preference per requirements or use details.timezone
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                // status: 'tentative', // Note: "status" in Event resource is confirmed/tentative/cancelled
                // But GCal UI treats "status" field as opaque often. 
                // "transparency": "opaque" (busy) vs "transparent" (free).
                // API allows `status: 'tentative'`.
                status: 'tentative',
                colorId: '8', // Grey/Graphite usually indicates tentative/low prio
            };
            console.log('[Calendar MCP] Event Payload:', JSON.stringify(event));
            const res = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            });
            console.log(`[Calendar MCP] Event created! Link: ${res.data.htmlLink}`);
            return { success: true, id: res.data.id, link: res.data.htmlLink };
        }
        catch (error) {
            if (error.message?.includes('insufficient authentication scopes')) {
                console.warn('[Calendar MCP] ⚠️  Creation Skipped: Token lacks Calendar Scope.');
                return { success: false, error: 'MISSING_CALENDAR_SCOPE' };
            }
            console.error('[Calendar MCP] Error:', error.message);
            return { success: false, error: error.message };
        }
    }
}
exports.GoogleCalendarService = GoogleCalendarService;
