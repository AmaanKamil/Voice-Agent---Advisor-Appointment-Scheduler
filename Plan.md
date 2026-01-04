# Step by Step Build Plan - CallNest

## Step 1: Voice Agent Configuration & Scripting
Define the Retell AI voice agent's behavior and guardrails.
- **Role**: Operational assistant for scheduling.
- **Script**: Greeting -> Intent Check -> Preference Gathering (Topic, Day, Time) -> Confirmation with Booking Code.
- **Guardrails**: No investment advice, no PII collection, strictly informational.

## Step 2: Intent & Entity Definition (Groq Inference)
Define the schema for post-call inference via Groq LLM.
- **Intents**: `BOOK_NEW`, `RESCHEDULE`, `CANCEL`, `PREPARE`, `CHECK_AVAILABILITY`.
- **Entities**: `topic`, `date`, `time`, `booking_code`, `client_name`.

## Step 3: MySQL Database Setup
Set up the system of record.
- **Tables**: `calls`, `bookings`, `audit_logs`.
- **Purpose**: Persist call metadata and confirmed tentative holds.

## Step 4: Backend Webhook Integration
Build the endpoint to receive Retell AI post-call events.
- **Route**: `POST /api/webhook/retell`.
- **Logic**: Extract call summary and trigger inference.

## Step 5: Groq Intent Inference Engine
Implement the logic to convert natural language summaries into structured data.
- **Model**: Llama-3.3-70b (via Groq).
- **Output**: JSON containing the determined intent and extracted entities.

## Step 6: Intent Routing & Deterministic Execution
Create the dispatcher that routes the inferred intent to specific services.
- **Route**: `IntentRouter.ts` parses the inference.
- **Service**: `BookingService` handles new bookings and orchestrates MCPs.

## Step 7: MCP Integration (Deterministic Side Effects)
Implement the backend capabilities (Model Context Protocol style).
- **Calendar MCP**: Creates a tentative hold in Google Calendar (IST).
- **Google Docs MCP**: Appends booking details to "Advisor Pre-Bookings" log.
- **Gmail MCP**: Drafts an approval-gated email for the advisor.

## Step 8: Evidence Production & Logging
Ensure every action is auditable.
- **Audit Logs**: Store raw payload and results of every MCP call.
- **Status Updates**: Mark bookings as `CONFIRMED` in the database.

## Step 9: Frontend Dashboard
Create a simple interface to trigger calls and view the status of recent bookings.
- **Framework**: Next.js / Tailwind.
- **Features**: Call trigger via Retell SDK, Health check indicators.
