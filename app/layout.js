import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'CDGI GameGrid',
  description: 'Elite Performance Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#19191c', color: '#f9f5f8', border: '1px solid rgba(184,253,55,0.2)' } }} />
        {children}
      </body>
    </html>
  );
}
