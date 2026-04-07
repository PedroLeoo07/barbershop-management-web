import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { CacheProvider } from '@/contexts/CacheContext';
import { RouteProgress } from '@/components/RouteProgress';
import '@/styles/globals.css';
import '@/styles/transitions-optimized.css';
import '@/styles/responsive.css';

// Configuração das fontes premium - OTIMIZADO
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  preload: false, // Lazy load
});

export const metadata: Metadata = {
  title: 'BarberShop - Sistema de Agendamentos',
  description: 'Sistema premium de gestão de agendamentos para barbearias',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: light)', color: '#1A1A1A' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BarberShop',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="dns-prefetch" href="//localhost:3001" />
        <link rel="preconnect" href="//localhost:3001" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <RouteProgress />
        <CacheProvider>
          <AuthProvider>{children}</AuthProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
