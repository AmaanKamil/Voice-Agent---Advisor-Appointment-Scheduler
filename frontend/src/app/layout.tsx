import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'CallNest AI',
  description: 'Voice-First AI Appointment Logic for Advisors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
