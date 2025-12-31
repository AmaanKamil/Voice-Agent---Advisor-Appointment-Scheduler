import db from '../db/connection';
import { InferredData } from './GroqService';

export class BookingService {
    static async handleBooking(call_id: string, data: InferredData) {
        console.log('--- Handling Booking ---');
        // 1. Generate Booking Code
        const bookingCode = `NL-${Math.floor(1000 + Math.random() * 9000)}`;

        // 2. Parse Date/Time (Mocking date parsing logic for now)
        // In a real app, I'd use date-fns or moment with timezone
        const startTimeStr = `${data.entities.date || '2025-01-01'} ${data.entities.time || '10:00 AM'}`;
        const startTime = new Date(startTimeStr); // Very basic parsing

        // 3. Store Booking
        await db('bookings').insert({
            booking_code: bookingCode,
            call_id,
            client_name: data.entities.client_name || 'Anonymous',
            topic: data.entities.topic || 'Consultation',
            start_time: startTime,
            status: 'TENTATIVE' // Wait for Confirmation flow or auto-confirm? User says "Draft or send advisor email", "Return confirmation message".
        });

        // 4. Create Calendar Event
        const [bookingId] = await db('bookings').where('booking_code', bookingCode).select('id');

        // db('bookings').insert returns [id] in some drivers, but knex mysql returns [id] on .returning() which isn't supported in mysql safely without tricks or secondary query.
        // Actually MySQL insert result is [id] if not specified? 
        // Knex MySQL insert returns [id] only.

        // Let's refetch to be safe or use result[0]

        // Create Calendar Event
        // await db('calendar_events').insert({...})

        // 5. Log Action
        await db('audit_logs').insert({
            call_id,
            action: 'BOOK_CREATED',
            details: `Created booking ${bookingCode} for ${data.entities.client_name}`
        });

        return { message: `Booking confirmed. Your code is ${bookingCode}.`, code: bookingCode };
    }

    static async handleReschedule(call_id: string, data: InferredData) {
        // Stub
        return { message: "Reschedule logic to be implemented." };
    }
}
