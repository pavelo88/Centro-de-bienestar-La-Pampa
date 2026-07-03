'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#05140b] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}