import './globals.css';
import { Toaster } from 'react-hot-toast';
import KeyboardScroller from '../components/KeyboardScroller';
import { AuthProvider } from '../lib/auth-context';
import RouteGuard from '../components/RouteGuard';
import ErrorBoundary from '../components/ErrorBoundary';

export const metadata = {
  title: 'GameGrid Sports',
  description: 'The Ultimate Sports Ecosystem',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <KeyboardScroller />
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#19191c', color: '#f9f5f8', border: '1px solid rgba(184,253,55,0.2)' } }} />
            <RouteGuard>
              {children}
            </RouteGuard>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
