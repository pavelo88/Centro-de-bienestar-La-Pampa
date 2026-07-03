import ModernBackground from '@/components/site/ModernBackground';
import PageTransition from '@/components/site/PageTransition';
import FluidBackground from '@/components/site/FluidBackground';
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
  title: 'Centro de Bienestar La Pampa | Santuario Wellness',
  applicationName: 'La Pampa',
  description: 'Centro de Bienestar La Pampa es catalogado como el mejor santuario wellness. Vida en comunidad de ultra-lujo, seguridad privada con IA de vanguardia, acceso biométrico, amplias áreas verdes exclusivas y un Wellness Center de 5 estrellas.',
  keywords: [
    'centro de bienestar la pampa', 'santuario wellness la pampa', 'mejor centro de bienestar', 'spa de ultra lujo',
    'seguridad privada ia', 'wellness center la pampa', 'lotes exclusivos pomasqui', 'consorcio la pampa',
    'exclusividad', 'bienestar', 'vida en comunidad', 'inmobiliaria de lujo'
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'La Pampa',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://urbanizacionlapampa.com',
    title: 'Centro de Bienestar La Pampa | Santuario Wellness',
    description: 'Experimenta la vida en el mejor barrio del mundo. Comunidad de ultra-lujo, seguridad impulsada por IA y un centro wellness de categoría mundial.',
    siteName: 'La Pampa',
    images: [
      {
        url: '/hero.png',
        width: 1200,
        height: 630,
        alt: 'Centro de Bienestar La Pampa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Centro de Bienestar La Pampa | Santuario Wellness',
    description: 'El pináculo del ultra-lujo inmobiliario. Seguridad de vanguardia y bienestar integral en el mejor barrio del mundo.',
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
            <FluidBackground />
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
