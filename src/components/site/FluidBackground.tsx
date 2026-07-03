'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function FluidBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none w-full h-full">
      {/* 
        Fluid Jellyfish-like glowing orbs 
        Uses CSS animations to create a slow, organic floating effect
      */}
      <div 
        className={`absolute w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob ${isDark ? 'bg-cyan-600/30' : 'bg-cyan-200/50'} top-[-10%] left-[-10%]`}
        style={{ animationDuration: '20s' }}
      ></div>
      
      <div 
        className={`absolute w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000 ${isDark ? 'bg-blue-600/20' : 'bg-blue-200/40'} bottom-[-10%] right-[-10%]`}
        style={{ animationDuration: '25s', animationDirection: 'reverse' }}
      ></div>

      <div 
        className={`absolute w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full mix-blend-screen filter blur-[90px] opacity-30 animate-blob animation-delay-4000 ${isDark ? 'bg-fuchsia-600/10' : 'bg-fuchsia-200/30'} top-[30%] left-[20%]`}
        style={{ animationDuration: '30s' }}
      ></div>

      {/* Subtle overlay gradient to blend everything smoothly */}
      <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-background/80 via-background/40 to-background/90' : 'from-background/80 via-background/30 to-background/90'}`}></div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
