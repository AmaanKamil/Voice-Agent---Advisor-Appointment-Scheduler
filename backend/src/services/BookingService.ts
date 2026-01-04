import db from '../db/connection';
import { InferredData } from './GroqService';
import { GoogleDocsService } from './GoogleDocsService';
import { GmailService } from './GmailService';
import { GoogleCalendarService } from './GoogleCalendarService';

export class BookingService {
    static async handleBooking(call_id: string, data: InferredData) {
        console.log('--- Handling Booking Execution ---');
        console.log(`Payload for Call ID: ${call_id}`);
        console.log('Entities:', JSON.stringify(data.entities));

        // 1. Generate Booking Code
        const bookingCode = `NL-${Math.floor(1000 + Math.random() * 9000)}`;

        // 2. Parse Date/Time
        let startTime = new Date();
        try {
            const dateStr = data.entities.date || new Date().toISOString().split('T')[0];
            const timeStr = data.entities.time || '10:00:00'; // Default to 10am if missing
            // Normalize "10:00 AM" to "10:00:00" if possible, or trust Date constructor
            const fullDateStr = `${dateStr} ${timeStr}`;
            startTime = new Date(fullDateStr);
            console.log(`Parsed Start Time: ${startTime.toISOString()} (from ${fullDateStr})`);

            if (isNaN(startTime.getTime())) {
                throw new Error('Invalid Date Generated');
            }
        } catch (e) {
            console.error('Date Parsing Failed, using NOW:', e);
            startTime = new Date();
        }

        try {
            // 3. Store Booking
            console.log(`Attempting DB Insert for Booking ${bookingCode}...`);
            const [id] = await db('bookings').insert({
                booking_code: bookingCode,
                call_id,
                client_name: data.entities.client_name || 'Anonymous',
                topic: data.entities.topic || 'General Consultation',
                start_time: startTime,
                status: 'CONFIRMED' // User says agent "confirms", so let's mark CONFIRMED
            });
            console.log(`✅ DB Insert Success! Booking ID: ${id}`);

            // 4. Create Calendar Event (Placeholder Logic - User says this works externally?)
            // If the user's "Calendar Integration" is actually supposed to be here, we would add:
            // await CalendarService.addToCalendar(...);

            // 5. Log Action
            await db('audit_logs').insert({
                call_id,
                action: 'BOOK_CREATED',
                details: `Created booking ${bookingCode} for ${data.entities.client_name} at ${startTime}`
            });

            // --- MCP INTEGRATION START ---

            // 6. Calendar MCP: Create Tentative Hold
            console.log('--- Triggering Calendar MCP ---');
            // Calculate end time (start + 30 mins) for display
            const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 mins later
            const calendarResult = await GoogleCalendarService.createTentativeHold({
                booking_code: bookingCode,
                topic: data.entities.topic || 'General Consultation',
                date: startTime.toISOString().split('T')[0],
                start_time: startTime.toTimeString().split(' ')[0],
                end_time: endTime.toTimeString().split(' ')[0],
                timezone: 'IST'
            });
            await db('audit_logs').insert({
                call_id,
                action: 'MCP_CALENDAR_HOLD',
                details: JSON.stringify(calendarResult)
            });

            // 7. Google Docs MCP: Append to "Advisor Pre-Bookings"
            console.log('--- Triggering Google Docs MCP ---');
            const docsResult = await GoogleDocsService.appendBooking({
                date: startTime.toLocaleDateString(),
                topic: data.entities.topic || 'General Consultation',
                slot: startTime.toLocaleTimeString(),
                booking_code: bookingCode
            });
            await db('audit_logs').insert({
                call_id,
                action: 'MCP_DOCS_APPEND',
                details: JSON.stringify(docsResult)
            });

            // 7. Gmail MCP: Create Draft for Advisor
            console.log('--- Triggering Gmail MCP ---');
            const advisorEmail = process.env.ADVISOR_EMAIL || 'advisor@callnest.com';
            const draftResult = await GmailService.createDraft({
                to: advisorEmail,
                subject: `New Advisor Booking – ${bookingCode}`,
                body: `A new tentative booking has been created.\n\nClient: ${data.entities.client_name || 'Anonymous'}\nTime: ${startTime.toString()}\nTopic: ${data.entities.topic || 'General Consultation'}\n\nPlease review and confirm.`
            });
            await db('audit_logs').insert({
                call_id,
                action: 'MCP_GMAIL_DRAFT',
                details: JSON.stringify(draftResult)
            });

            // --- MCP INTEGRATION END ---

            return { message: `Booking confirmed. Reference: ${bookingCode}`, code: bookingCode };

        } catch (error: any) {
            console.error('❌ CRITICAL DB ERROR in BookingService:', error);
            console.error('Failed Payload:', { bookingCode, call_id, start_time: startTime });
            // Re-throw so WebhookController knows it failed
            throw error;
        }
    }

    static async handleReschedule(call_id: string, data: InferredData) {
        // Stub
        return { message: "Reschedule logic to be implemented." };
    }
}
