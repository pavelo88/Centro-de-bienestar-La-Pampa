'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2 md:gap-4 transition-all duration-500", className)}>
      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
        {/* Monoline Symmetrical SVG Logo */}
        <svg className="w-14 h-14 text-[#C5A059] shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.75" />
          
          {/* Symmetrical Geometric Lotus outline representing wellness & Pampa valley */}
          <path d="M50 72 C42 60, 36 50, 36 38 C44 48, 48 55, 50 72 Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 72 C58 60, 64 50, 64 38 C56 48, 52 55, 50 72 Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 72 C46 52, 44 40, 50 24 C56 40, 54 52, 50 72 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          
          <circle cx="50" cy="18" r="1.5" fill="currentColor" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col justify-center leading-none mt-1 font-headline">
          <span className="text-xl md:text-3xl font-light tracking-tight text-[#333333] dark:text-slate-200 lowercase italic">
            la pampa
          </span>
          <span className="text-[10px] font-black text-[#C5A059] tracking-[0.25em] uppercase mt-0.5 whitespace-nowrap">
            santuario wellness
          </span>
        </div>
      )}
    </div>
  );
};

// Monoline Yoga Icon (Lotus & Sunrise)
export const YogaIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21 C9 17 7 13 7 9 C10 12 11 15 12 21 Z" />
    <path d="M12 21 C15 17 17 13 17 9 C14 12 13 15 12 21 Z" />
    <path d="M12 21 C11 15 10 10 12 5 C14 10 13 15 12 21 Z" />
    <circle cx="12" cy="3" r="1" />
  </svg>
);

// Monoline Tai Chi Icon (Yin-Yang wave)
export const TaiChiIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" strokeDasharray="1.5 1.5" />
    <path d="M12 3 C7.5 3 7.5 12 12 12 C16.5 12 16.5 21 12 21" />
    <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
  </svg>
);

// Monoline Bungee Fitness Icon (Suspension balance)
export const BungeeIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="2" x2="12" y2="10" />
    <path d="M6 10 C6 16, 18 16, 18 10" />
    <path d="M9 14 C9 18, 15 18, 15 14" />
    <circle cx="12" cy="20" r="1" />
  </svg>
);

// Monoline Kangoo Jumps Icon (Spring lines)
export const KangooIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 14 C4 18, 20 18, 20 14" />
    <path d="M6 11 C6 15, 18 15, 18 11" />
    <path d="M12 3 L12 11" />
    <path d="M8 6 L12 3 L16 6" />
  </svg>
);
