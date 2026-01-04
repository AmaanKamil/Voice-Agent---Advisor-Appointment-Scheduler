# CallNest: Advisor Appointment Pre-Booking System

## Project Overview
CallNest is a voice-first advisor appointment pre-booking system designed to automate the initial scheduling process. It uses a high-fidelity voice agent to interact with callers, gather their preferences, and confirm tentative bookings. The system follows a **post-call execution model**, where the heavy-lifting of intent inference and external integrations happens after the voice conversation is completed, ensuring a smooth and uninterrupted user experience.

## Problem Statement
Traditional appointment scheduling often involves long wait times or complex menu systems. CallNest solves this by providing a natural language interface that feels like talking to a real assistant. By decoupling the voice interaction from the backend processing, the system maintains high performance and reliability while still producing all necessary digital evidence (calendar holds, logs, and drafts).

## High-Level Architecture
CallNest is built with a modular architecture that separates the voice layer, the inference engine, and the execution capabilities.

1.  **Voice Layer (Retell AI)**: Handles the real-time conversation. It follows a strict script to gather preferences and confirms the booking verbally to the caller.
2.  **Inference Engine (Groq LLM)**: Once the call ends, the backend receives a summary. It uses the `llama-3.3-70b-versatile` model on Groq to infer the caller's intent and extract entities (topic, date, time, etc.) from the conversation.
3.  **Core Backend (Express/TypeScript)**: Orchestrates the intent routing and manages the connection to the system of record.
4.  **Database (MySQL)**: The system of record for all calls, confirmed bookings, and audit trails.
5.  **MCP Capabilities**: Specialized backend services (Model Context Protocol style) that handle deterministic side effects like Google Calendar events and Gmail drafts.

## End-to-End Flow
1.  **Caller Interaction**: The caller speaks with the Retell AI agent. The agent gathers the topic, preferred date, and time, and provides a unique booking code (e.g., `NL-1234`).
2.  **Post-Call Webhook**: Immediately after the call hangs up, Retell sends a natural language summary to the CallNest backend.
3.  **Intent Inference**: The backend sends this summary to Groq. Groq parses the summary into a structured JSON containing one of the 5 supported intents and relevant entities.
4.  **Deterministic Execution**: Based on the inferred intent, the backend triggers the relevant MCPs:
    *   **Calendar**: Creates a 30-minute tentative hold.
    *   **Google Docs**: Appends the booking to a consolidated log.
    *   **Gmail**: Creates an email draft for the advisor to review.
5.  **Audit Logging**: Every step of the execution is logged in the MySQL database for transparency and review.

## Supported Intents
The system is optimized for exactly five deterministic intents:
1.  **BOOK_NEW**: Create a new tentative advisor slot.
2.  **RESCHEDULE**: Request a change to an existing tentative booking.
3.  **CANCEL**: Terminate a tentative booking.
4.  **PREPARE**: Explain what a caller should prepare (e.g., documentation, ID).
5.  **CHECK_AVAILABILITY**: Share general advisor availability windows (e.g., Mon-Fri 9AM-5PM IST).

## MCPs (Model Context Protocol Style Backend Capabilities)
MCPs are backend-exclusive services that perform specific actions. They are **not** connected to Retell directly, ensuring that the voice agent never struggles with real-time API latency.
*   **Calendar MCP**: Generates a tentative event in Google Calendar.
*   **Google Docs MCP**: Appends entries to the "Advisor Pre-Bookings" document.
*   **Gmail MCP**: Create approval-gated email drafts (never sends automatically).

## Key Design Decisions
*   **Post-Call Execution**: We chose to process intents after the call to ensure the voice agent remains conversational and never hangs or lags due to backend API delays.
*   **Tentative Holds**: The system creates "locks" rather than final bookings, allowing human advisors to review and confirm via the drafted emails.
*   **No PII Collection**: To ensure data privacy, the agent does not ask for or store sensitive personal information like passwords or financial identifiers.
*   **IST Standardization**: To avoid timezone confusion during advisor consultations, all times are handled and displayed in Indian Standard Time (IST).

## Tech Stack
*   **Frontend**: Next.js 15, Tailwind CSS, Retell Client SDK.
*   **Backend**: Node.js (Express), TypeScript, Groq SDK.
*   **Database**: MySQL (hosted locally or via planetscale-style providers).
*   **Integrations**: Retell AI (Voice), Google Workspace APIs (Calendar, Docs, Gmail).

## Environment Variable Setup
Create a `.env` file in the root directory with the following variables:
```env
# Server Config
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=callnest

# AI & Voice
RETELL_API_KEY=your_retell_api_key
GROQ_API_KEY=your_groq_api_key

# Google APIs (OAuth / Service Account)
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REFRESH_TOKEN=your_token

# Advisor Config
ADVISOR_EMAIL=advisor@example.com
```

## How to Run Locally
1.  **Clone the Repository**:
    ```bash
    git clone <repo-url>
    cd CallNest
    ```
2.  **Install Dependencies**:
    ```bash
    # Root
    npm install
    # Backend
    cd backend && npm install
    # Frontend
    cd ../frontend && npm install
    ```
3.  **Setup Database**: Run the schema provided in `backend/src/db/schema.sql` on your local MySQL instance.
4.  **Start the Servers**:
    ```bash
    # Term 1: Backend
    cd backend
    npm start
    
    # Term 2: Frontend
    cd frontend
    npm run dev
    ```

## Evidence Produced
Every successful booking produces the following verifiable evidence:
1.  **Database Entry**: A record in the `bookings` table with a unique code.
2.  **Calendar Hold**: A tentative block in the advisor's Google Calendar.
3.  **Google Doc Entry**: A new line in the "Advisor Pre-Bookings" document.
4.  **Email Draft**: A ready-to-send draft in the advisor's Gmail inbox.
5.  **Audit Log**: A full execution trace in the `audit_logs` table.
