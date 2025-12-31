import { InferredData } from './GroqService';
import { BookingService } from './BookingService';
import { RescheduleService, CancelService } from './OtherServices';
import db from '../db/connection';

export class IntentRouter {
    static async route(call_id: string, inference: InferredData) {
        console.log(`Routing inference: ${inference.intent}`);

        let result;

        switch (inference.intent) {
            case 'BOOK_NEW':
                result = await BookingService.handleBooking(call_id, inference);
                break;
            case 'RESCHEDULE':
                result = await RescheduleService.handle(call_id, inference);
                break;
            case 'CANCEL':
                result = await CancelService.handle(call_id, inference);
                break;
            case 'PREPARE':
                result = { message: "Please bring your ID and past financial records." };
                break;
            case 'CHECK_AVAILABILITY':
                result = { message: "We are available Mon-Fri 9AM-5PM IST." };
                break;
            default:
                console.warn('Unknown intent');
                result = { message: "Could not determine intent." };
        }

        // Log the execution result
        await db('audit_logs').insert({
            call_id,
            action: `EXECUTE_${inference.intent}`,
            details: JSON.stringify(result)
        });

        return result;
    }
}
