"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentRouter = void 0;
const BookingService_1 = require("./BookingService");
const OtherServices_1 = require("./OtherServices");
const connection_1 = __importDefault(require("../db/connection"));
class IntentRouter {
    static async route(call_id, inference) {
        console.log(`Routing inference: ${inference.intent}`);
        let result;
        switch (inference.intent) {
            case 'BOOK_NEW':
                result = await BookingService_1.BookingService.handleBooking(call_id, inference);
                break;
            case 'RESCHEDULE':
                result = await OtherServices_1.RescheduleService.handle(call_id, inference);
                break;
            case 'CANCEL':
                result = await OtherServices_1.CancelService.handle(call_id, inference);
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
        await (0, connection_1.default)('audit_logs').insert({
            call_id,
            action: `EXECUTE_${inference.intent}`,
            details: JSON.stringify(result)
        });
        return result;
    }
}
exports.IntentRouter = IntentRouter;
