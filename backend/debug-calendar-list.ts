
import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const auth = () => {
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN) {
        const oAuth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );
        oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
        return oAuth2Client;
    }
    return null;
};

async function listEvents() {
    try {
        const client = auth();
        if (!client) {
            console.log('No credentials found');
            return;
        }

        const calendar = google.calendar({ version: 'v3', auth: client });

        console.log('Fetching recent events...');
        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: '2025-02-01T00:00:00Z',
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = res.data.items || [];
        console.log('Upcoming 10 events:');
        if (events.length === 0) {
            console.log('No upcoming events found.');
        } else {
            events.forEach((event: any, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${i + 1}. [${start}] - ${event.summary} (${event.status})`);
            });
        }

    } catch (error) {
        console.error('Error listing events:', error);
    }
}

listEvents();
