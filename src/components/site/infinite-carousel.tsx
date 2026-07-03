'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface CarouselItem {
  icon: any;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
}

interface InfiniteCarouselProps {
  items: CarouselItem[];
  onItemClick: (item: CarouselItem) => void;
}

export function InfiniteCarousel({ items, onItemClick }: InfiniteCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  }, [items.length]);

  // Optional: Auto-play
  // useEffect(() => {
  //   const timer = setInterval(nextSlide, 5000);
  //   return () => clearInterval(timer);
  // }, [nextSlide]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    })
  };

  const item = items[currentIndex];

  return (
    <div className="relative w-full h-[450px] overflow-hidden rounded-2xl glass-panel border border-pampa-oro/20 bg-black/20">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 }
          }}
          className="absolute inset-0 flex flex-col cursor-pointer"
          onClick={() => onItemClick(item)}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              nextSlide();
            } else if (swipe > swipeConfidenceThreshold) {
              prevSlide();
            }
          }}
        >
          {/* Image (Mobile only) */}
          <div className="relative w-full h-56 shrink-0 overflow-hidden">
            <Image 
              src={item.image} 
              fill 
              className="object-cover" 
              alt={item.title} 
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          </div>

          <div className="p-6 flex flex-col justify-between grow space-y-4 relative z-10 -mt-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-pampa-oro p-3 bg-black/60 backdrop-blur-md rounded-xl w-fit shadow-lg border border-white/10">
                  <item.icon className="w-8 h-8 stroke-[0.75]" />
                </div>
              </div>
              
              <div className="space-y-1 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 drop-shadow-sm">
                  {item.subtitle}
                </span>
                <h3 className="text-2xl font-medium text-white font-serif tracking-tight drop-shadow-sm">
                  {item.title}
                </h3>
              </div>
              
              <p className="text-sm text-white/80 font-light leading-relaxed line-clamp-3">
                {item.desc}
              </p>
            </div>
            
            <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-auto">
              <span className="text-[10px] uppercase tracking-widest text-pampa-oro font-bold mt-2">Abrir Galería</span>
              <ArrowRight className="w-4 h-4 text-pampa-oro mt-2" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button 
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 z-20 hover:bg-pampa-oro transition-colors"
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 z-20 hover:bg-pampa-oro transition-colors"
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {items.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-pampa-oro w-4' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};
