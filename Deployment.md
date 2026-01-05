# Deployment Guide - CallNest

This guide covers how to deploy the **CallNest** Advisor Appointment Scheduler to production using **Render** (Backend) and **Vercel** (Frontend).

## Prerequisites
- A GitHub repository containing this project code.
- A [Render](https://render.com/) account (free tier works).
- A [Vercel](https://vercel.com/) account (free tier works).
- Your API keys ready (Retell, Groq, Google, etc.).

---

## Part 1: Deploy Backend (Render)

1.  **Create New Web Service**
    - Go to Render Dashboard -> New -> Web Service.
    - Connect your GitHub repository.

2.  **Configuration**
    - **Name**: `callnest-backend`
    - **Root Directory**: `backend`
    - **Runtime**: Node
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm run start`

3.  **Environment Variables**
    Add the following variables (copy values from your local `.env` or see `backend/.env.example`):
    - `NODE_ENV` = `production`
    - `PORT` = `10000` (Render's default)
    - `FRONTEND_URL` = `https://your-vercel-app.vercel.app` (add this *after* deploying frontend, or use `*` temporarily)
    - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (Your MySQL credentials)
    - `RETELL_API_KEY`
    - `GROQ_API_KEY`
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
    - `ADVISOR_EMAIL`

4.  **Deploy**
    - Click "Create Web Service".
    - Wait for the build to finish. Check logs to see `CallNest Backend running on port 10000`.
    - **Copy the Service URL** (e.g., `https://callnest-backend.onrender.com`).

---

## Part 2: Deploy Frontend (Vercel)

1.  **Create New Project**
    - Go to Vercel Dashboard -> Add New -> Project.
    - Import your GitHub repository.

2.  **Configuration**
    - **Root Directory**: Edit and select `frontend`.
    - **Framework Preset**: Next.js (should detect automatically).

3.  **Environment Variables**
    - Add `NEXT_PUBLIC_API_BASE_URL` with the value of your **Render Backend URL** (e.g., `https://callnest-backend.onrender.com`).
    *Note: Do not add trailing slash.*

4.  **Deploy**
    - Click "Deploy".
    - Wait for the build to complete.
    - Your site is now live!

---

## Part 3: Final Integration Steps

1.  **Update Retell Webhook**
    - Log in to your [Retell AI Dashboard](https://console.retellai.com/).
    - Go to your Agent settings.
    - Update the **Post-Call Webhook URL** to your production backend:
      `https://<YOUR-RENDER-URL>/api/webhook/retell`

2.  **Update CORS (Optional)**
    - Once your Vercel frontend is live, go back to Render Environment Variables.
    - Update `FRONTEND_URL` to your actual Vercel domain (e.g., `https://callnest-frontend.vercel.app`) for better security.

3.  **Test the Flow**
    - Open your Vercel site.
    - Click "Try Live Voice Demo".
    - Speak with the agent and confirm a booking.
    - Verify that the Calendar event, Google Doc entry, and Email draft are created.
