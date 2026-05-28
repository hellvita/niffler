import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SessionExpiredProvider } from '@/components/providers/SessionExpiredContext';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Niffler',
  description: 'Personal finance tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}else if(t==='light'){document.documentElement.classList.add('light');}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SessionExpiredProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionExpiredProvider>
      </body>
    </html>
  );
}
