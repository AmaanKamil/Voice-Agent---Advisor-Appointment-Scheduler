"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqService = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || 'dummy_key',
});
class GroqService {
    static async inferIntent(callSummary) {
        if (!callSummary) {
            throw new Error("Call summary is empty");
        }
        const systemPrompt = `
    You are the brain of an appointment scheduling system.
    Analyze the call summary and extract the intent and entities.
    
    Supported Intents:
    1. BOOK_NEW: User wants to book a new appointment.
    2. RESCHEDULE: User wants to change an existing appointment.
    3. CANCEL: User wants to cancel an appointment.
    4. PREPARE: User asked what to prepare for a consultation.
    5. CHECK_AVAILABILITY: User asked for availability windows but didn't book.
    
    Output strictly in JSON format with this structure:
    {
      "intent": "BOOK_NEW" | "RESCHEDULE" | "CANCEL" | "PREPARE" | "CHECK_AVAILABILITY" | "UNKNOWN",
      "confidence": 0.0 to 1.0,
      "entities": {
        "booking_code": "if mentioned",
        "topic": "summary of topic",
        "date": "YYYY-MM-DD if mentioned",
        "time": "HH:MM AM/PM if mentioned",
        "timezone": "if mentioned",
        "client_name": "if mentioned"
      }
    }
    
    Do not output markdown code blocks. Just the raw JSON.
    `;
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: callSummary },
                ],
                model: 'llama-3.3-70b-versatile', // Updated to latest supported model
                temperature: 0,
                response_format: { type: 'json_object' }
            });
            const content = completion.choices[0]?.message?.content;
            if (!content)
                throw new Error('No content from Groq');
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Groq Inference Error:', error);
            return {
                intent: 'UNKNOWN',
                confidence: 0,
                entities: {}
            };
        }
    }
}
exports.GroqService = GroqService;
