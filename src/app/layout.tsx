import ModernBackground from '@/components/site/ModernBackground';
import PageTransition from '@/components/site/PageTransition';
import ParticleBackground from '@/components/site/ParticleBackground';
import SEOStructuredData from '@/components/site/seo-structured-data';
import { ThemeProvider } from '@/components/site/theme-provider';
import SmartAssistant from '@/components/site/SmartAssistant';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://urbanizacionlapampa.com'),
  title: 'Urbanización La Pampa  |  Barrio Exclusivo y Bienestar',
  applicationName: 'La Pampa',
  description: 'Urbanización La Pampa: El mejor barrio del mundo. Vida en comunidad de alto nivel, seguridad privada con tecnología de vanguardia, amplias áreas verdes exclusivas y Wellness Center.',
  keywords: [
    'urbanizacion la pampa', 'la pampa barrio cerrado', 'barrio de lujo',
    'seguridad privada', 'wellness center la pampa', 'lotes exclusivos', 'consorcio la pampa',
    'exclusividad', 'bienestar', 'vida en comunidad'
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'La Pampa',
  },
  icons: {
    apple: '/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://urbanizacionlapampa.com',
    title: 'Urbanización La Pampa | Exclusividad, Seguridad y Bienestar',
    description: 'Vida en comunidad de alto nivel con seguridad de punta y centro wellness de 5 estrellas.',
    siteName: 'La Pampa',
    images: [
      {
        url: '/hero.png',
        width: 1200,
        height: 630,
        alt: 'Urbanización La Pampa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urbanización La Pampa | Exclusividad, Seguridad y Bienestar',
    description: 'El mejor barrio del mundo: seguridad de vanguardia y bienestar integral.',
    images: ['/hero.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="bg-transparent">
      {/* TRANSPARENCIA TOTAL: 
          - bg-transparent elimina cualquier color de fondo sólido.
          - relative z-10 asegura que el contenido flote sobre los fondos animados.
      */}
      <body className={cn(
        'min-h-screen font-body antialiased bg-transparent text-foreground relative',
        fontBody.variable
      )}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <FirebaseClientProvider>

            {/* Los fondos se renderizan detrás de todo */}
            <ParticleBackground />
            <ModernBackground />
            <SEOStructuredData />

            {/* z-10 para que el texto sea legible y cliqueable */}
            <main className="relative z-10 flex flex-col min-h-screen">
              <PageTransition>
                {children}
              </PageTransition>
            </main>

            <SmartAssistant />
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
