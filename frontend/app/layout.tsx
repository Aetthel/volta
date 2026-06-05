import { Inter } from 'next/font/google';
import { SessionProvider } from "next-auth/react";
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Volta - Admin Pro',
  description: 'Gestión clínica para salones de belleza de alto rendimiento.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable}`}>
      <body className="min-h-screen font-sans font-normal bg-surface text-on-surface antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
