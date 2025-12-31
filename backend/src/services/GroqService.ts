import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy_key',
});

export interface InferredData {
    intent: 'BOOK_NEW' | 'RESCHEDULE' | 'CANCEL' | 'PREPARE' | 'CHECK_AVAILABILITY' | 'UNKNOWN';
    confidence: number;
    entities: {
        booking_code?: string;
        topic?: string;
        date?: string;
        time?: string;
        timezone?: string;
        client_name?: string;
        client_email?: string;
    };
    summary?: string; // Original summary
}

export class GroqService {
    static async inferIntent(callSummary: string): Promise<InferredData> {
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
                model: 'llama3-70b-8192', // or mixtral-8x7b-32768
                temperature: 0,
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No content from Groq');

            return JSON.parse(content) as InferredData;
        } catch (error) {
            console.error('Groq Inference Error:', error);
            return {
                intent: 'UNKNOWN',
                confidence: 0,
                entities: {}
            };
        }
    }
}
