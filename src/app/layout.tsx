import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChatGPT Clone',
  description: 'A simple ChatGPT-like chat application built with Next.js 14, TypeScript and Tailwind CSS.',
};

/**
 * Root layout for the application. This wraps every page and ensures
 * Tailwind styles are loaded. It also sets up the basic HTML structure.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-gray-900">
        {children}
      </body>
    </html>
  );
}