# Step by step build plan

## Step 1: Freeze the conversation script

Before writing any code, write the flow in plain English.

### Example:

- Greeting

- Disclaimer

- Ask intent

- If booking → ask topic

- Ask day preference

- Ask time preference

- Offer two slots

- Confirm

- Read booking code

- Share secure link

This becomes your script file deliverable later.

## Step 2: Define intents and entities

Explicitly define:

### Intents:

- book_new

- reschedule

- cancel

- what_to_prepare

- check_availability

### Entities:

- topic

- preferred_day

- preferred_time

- slot_choice

This prevents messy logic later.

## Step 3: Create mock calendar JSON

Create a simple JSON file like:

- Dates

- Time slots

- Availability true or false

This will be referenced when offering two slots.

This file will be mentioned in README.

## Step 4: Build the voice agent prompt

Your system prompt should clearly say:

- You are informational only

- You cannot give investment advice

- You must not collect PII

- You must repeat date and time in IST before confirming

- You must generate booking code after confirmation

This prompt controls most behavior.

## Step 5: Implement slot selection logic

### Logic:

- User gives day or time preference

- Filter mock calendar

- Pick two closest matching slots

- If none match → waitlist path

Keep this deterministic and simple.

## Step 6: Generate booking code

### On confirm:

- Generate code like NL-A742

- Keep it short and readable

- Store it in memory for that call

This code is used everywhere else.

## Step 7: Trigger MCP tools

### After confirmation:

#### Calendar MCP

- Create tentative hold

- Title must include topic and booking code

#### Notes MCP

- Append entry with date, topic, slot, code

#### Email Draft MCP

- Draft email for advisor

#### Mark it approval gated

Each tool returns a success response you can screenshot.

## Step 8: Read confirmation to caller

### Voice agent must:

- Repeat date and time in IST

- Read booking code clearly

- Share secure URL

- Close politely

This is important for evaluation.

## Step 9: Handle other intents

### Keep them simple:

- Reschedule → ask for booking code, update mock entry

- Cancel → mark cancelled, draft email

- What to prepare → generic checklist

- Check availability → read upcoming windows
