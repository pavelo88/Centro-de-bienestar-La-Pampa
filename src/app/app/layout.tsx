'use client';

import { DollarSign, UserCircle, QrCode, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.replace('/');
    }
  };

  const navItems = [
    { name: 'Perfil', path: '/app/perfil', icon: UserCircle },
    { name: 'Suscripción', path: '/app/pagos', icon: DollarSign },
    { name: 'Pase QR', path: '/app/qr', icon: QrCode },
  ];

  return (
    <div className="bg-[#05140b] min-h-screen flex flex-col text-white pb-20 relative font-body selection:bg-[#C5A059]/20">
      {/* Glow Ambientales */}
      <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-[#C5A059]/10 to-transparent pointer-events-none" />
      
      {/* Header Minimalista (PWA) */}
      <header className="sticky top-0 z-50 bg-[#05140b]/80 backdrop-blur-md border-b border-[#C5A059]/20 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-serif tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-[#ebd7a1]">La Pampa</h1>
        <button onClick={handleLogout} className="text-[#777777] hover:text-[#C5A059] transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
        {children}
      </main>

      {/* Bottom Navigation Bar (PWA Style) */}
      <nav className="fixed bottom-0 w-full bg-[#05140b]/90 backdrop-blur-lg border-t border-[#C5A059]/20 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-[#C5A059]' : 'text-[#777777] hover:text-white'
                }`}
              >
                <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]' : ''} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
