'use client';

import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();

  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    let isMounted = true;

    const checkPortalAccess = async () => {
      if (isUserLoading) return;

      if (!user || !user.email || !firestore) {
        if (isMounted) {
          setAuthStatus('unauthorized');
          router.replace('/auth/login');
        }
        return;
      }

      // If user is authenticated, we consider them authorized for the portal.
      // Roles are checked to redirect away from /admin, but /portal is the default logged-in view.
      if (isMounted) {
        setAuthStatus('authorized');
      }
    };

    void checkPortalAccess();

    return () => {
      isMounted = false;
    };
  }, [user, isUserLoading, firestore, router]);

  if (authStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="h-16 w-16 animate-spin text-[#C5A059]" />
      </div>
    );
  }

  if (authStatus === 'unauthorized') {
    return null;
  }

  // NOTE: /portal/page.tsx already has Navbar and Footer rendered inside it, 
  // but usually Layouts should have it. To avoid double Navbars, we just render children here, 
  // or we can remove Navbar/Footer from page.tsx. Since the page already has it, we just return children.
  return <>{children}</>;
}
