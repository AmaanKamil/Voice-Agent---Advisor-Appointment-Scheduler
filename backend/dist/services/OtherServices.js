"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelService = exports.RescheduleService = void 0;
const connection_1 = __importDefault(require("../db/connection"));
class RescheduleService {
    static async handle(call_id, data) {
        console.log('--- Handling Reschedule ---');
        // Logic: Find booking by code (if provided) or fuzzy match client name
        // For now, just log and return success
        await (0, connection_1.default)('audit_logs').insert({
            call_id,
            action: 'RESCHEDULE_REQUESTED',
            details: JSON.stringify(data.entities)
        });
        return { message: 'Reschedule request received. An agent will contact you.' };
    }
}
exports.RescheduleService = RescheduleService;
class CancelService {
    static async handle(call_id, data) {
        console.log('--- Handling Cancellation ---');
        await (0, connection_1.default)('audit_logs').insert({
            call_id,
            action: 'CANCEL_REQUESTED',
            details: JSON.stringify(data.entities)
        });
        return { message: 'Cancellation processed.' };
    }
}
exports.CancelService = CancelService;
