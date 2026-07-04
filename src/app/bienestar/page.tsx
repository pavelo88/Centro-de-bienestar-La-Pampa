'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, QrCode, User, Check, ChevronRight, Heart, Activity, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { generateDynamicQRToken } from '@/lib/qr-utils';
import { bookWellnessSession } from '@/lib/reservations';
import QRCode from 'react-qr-code';
import Image from 'next/image';
import { YogaIcon, TaiChiIcon, BungeeIcon, KangooIcon } from '@/components/icons';

interface Discipline {
  id: string;
  title: string;
  intensity: string;
  duration: string;
  instructor: string;
  schedule: string;
  description: string;
  benefits: string[];
  image: string;
  icon: React.ComponentType<{ className?: string }>;
}

const disciplines: Discipline[] = [
  {
    id: 'yoga',
    title: 'Hatha Yoga Zen',
    intensity: 'Suave / Meditación',
    duration: '75 min',
    instructor: 'Yogui Master Anand (India)',
    schedule: 'Lunes a Jueves • 07:00 & 18:30',
    description: 'Encuentre balance absoluto conectando cuerpo y mente a través del Hatha Yoga. Sesiones holísticas diseñadas para calmar el sistema nervioso en nuestro deck rodeado de naturaleza.',
    benefits: ['Reduce cortisol', 'Alineación postural', 'Fuerza isométrica'],
    image: '/images/yoga-space.png',
    icon: YogaIcon
  },
  {
    id: 'tai-chi',
    title: 'Tai Chi Chuan',
    intensity: 'Bajo Impacto / Fluido',
    duration: '60 min',
    instructor: 'Shifu Wu Chen (China)',
    schedule: 'Martes & Viernes • 08:30',
    description: 'Meditación en movimiento. Mejore su balance, flexibilidad y canalización del Qi en una experiencia armoniosa de bajo impacto ideal para la longevidad.',
    benefits: ['Balance físico', 'Estimulación del Qi', 'Flexibilidad articular'],
    image: '/images/hero-spa.png',
    icon: TaiChiIcon
  },
  {
    id: 'bungee',
    title: 'Bungee Fitness VIP',
    intensity: 'Alto Impacto / Cardio',
    duration: '50 min',
    instructor: 'Coach Valeria Gómez (Colombia)',
    schedule: 'Miércoles & Sábado • 09:30',
    description: 'Entrenamiento de resistencia suspendido. Experimente la gravedad cero, flote en el aire y active su núcleo en una sesión estimulante de bajo impacto articular.',
    benefits: ['Quema de 700 kcal', 'Cero impacto articular', 'Fuerza explosiva core'],
    image: '/images/yoga-space.png',
    icon: BungeeIcon
  },
  {
    id: 'kangoo',
    title: 'Kangoo Jumps Pro',
    intensity: 'Extremo / Divertido',
    duration: '45 min',
    instructor: 'Instructor Daniel Cifuentes',
    schedule: 'Lunes a Viernes • 19:30',
    description: 'Cardio de alta densidad a través de botas de rebote. Estimule el drenaje linfático, tonifique glúteos y libere dopamina saltando al ritmo de música clubbing.',
    benefits: ['Drenaje linfático', 'Absorción de impacto', 'Alta liberación de dopamina'],
    image: '/images/hero-spa.png',
    icon: KangooIcon
  }
];

export default function WellnessPortal() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline>(disciplines[0]);
  const [bookingName, setBookingName] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [qrData, setQrData] = useState<string | null>(null);
  const db = useFirestore();

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setBookingStatus('loading');
    
    try {
      // Create a unique session ID based on date and discipline
      const sessionId = `${selectedDiscipline.id}_${bookingDate.replace(/[^a-zA-Z0-9]/g, '-')}`;
      
      const res = await bookWellnessSession(bookingName, sessionId, 25);
      
      if (!res.success) {
        alert(res.message);
        setBookingStatus('idle');
        return;
      }
      
      // Use dynamic QR for wellness reservation
      const payload = generateDynamicQRToken(bookingName, sessionId);
      setQrData(payload);
      setBookingStatus('success');
      
      setTimeout(() => {
        setBookingStatus('idle');
        setBookingName('');
        setBookingDate('');
        setQrData(null);
      }, 15000);
      
    } catch (error) {
      console.error(error);
      setBookingStatus('idle');
      alert("Error al reservar. Por favor intente de nuevo.");
    }
  };

  return (
    <div className="relative bg-transparent text-foreground min-h-screen overflow-x-hidden pt-28 pb-16 selection:bg-pampa-oro/20 selection:text-foreground transition-colors duration-700">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mt-8 mb-20 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-panel">
            <Sparkles className="w-3.5 h-3.5 text-pampa-oro" />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-pampa-oro">Reservas</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-serif text-foreground drop-shadow-sm uppercase italic">
            Clases de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-pampa-oro">Bienestar</span>
          </h1>
          
          <p className="text-base text-foreground/80 font-light leading-relaxed max-w-2xl mx-auto">
            Disfrute de disciplinas diseñadas para el rejuvenecimiento y la vitalidad del cuerpo. Reserve su lugar con confirmación instantánea.
          </p>
        </motion.div>

        {/* Dynamic Class Showcase & Grid Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* List of Disciplines Selector */}
            <div className="lg:col-span-4 space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-pampa-oro mb-6 px-2">Disciplinas Disponibles</h2>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="space-y-4"
            >
              {disciplines.map((d) => {
                const isActive = selectedDiscipline.id === d.id;
                const DisciplineIcon = d.icon;
                return (
                  <motion.button
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    key={d.id}
                    onClick={() => setSelectedDiscipline(d)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-6 rounded-2xl transition-all duration-500 relative overflow-hidden group ${
                      isActive 
                        ? 'bg-background/80 backdrop-blur-md border border-pampa-oro shadow-[0_10px_30px_rgba(197,160,89,0.15)]' 
                        : 'glass-panel border-white/5 hover:border-pampa-oro/40'
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-xl transition-colors duration-500 ${isActive ? 'bg-pampa-oro/10 text-pampa-oro border border-pampa-oro/50' : 'bg-background/50 text-foreground/50 border border-white/10 group-hover:text-pampa-oro'}`}>
                          <DisciplineIcon className="w-8 h-8 stroke-[0.75]" />
                        </div>
                        <div className="space-y-1">
                          <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors duration-500 ${isActive ? 'text-cyan-500' : 'text-foreground/50'}`}>
                            {d.intensity} • {d.duration}
                          </span>
                          <h3 className="text-2xl font-medium text-foreground font-serif">{d.title}</h3>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-pampa-oro rotate-90' : 'text-foreground/20 group-hover:translate-x-1 group-hover:text-pampa-oro'}`} />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedDiscipline.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center space-y-2 relative z-20">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#C5A059] tracking-tight uppercase italic drop-shadow-md">
                    {selectedDiscipline.title}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-xs text-foreground/70 font-medium uppercase tracking-[0.15em]">
                    <User className="w-3.5 h-3.5 text-[#C5A059]" />
                    {selectedDiscipline.instructor}
                    <span className="text-[#C5A059] mx-2">•</span>
                    <span>{selectedDiscipline.duration}</span>
                  </div>
                </div>

                <div className="rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row relative overflow-hidden bg-background/90 backdrop-blur-3xl border border-[#C5A059]/30">
                  
                  {/* Left Side: Image and Benefits */}
                  <div className="w-full lg:w-[45%] h-[300px] lg:h-auto min-h-[400px] relative z-0 shrink-0">
                    <motion.div
                      initial={{ scale: 1.05, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0"
                    >
                      <Image 
                        src={selectedDiscipline.image} 
                        alt={selectedDiscipline.title} 
                        fill 
                        className="object-cover object-center"
                      />
                    </motion.div>

                    <div className="absolute bottom-6 left-6 right-6 hidden sm:flex flex-wrap justify-center gap-3">
                      {selectedDiscipline.benefits.map((b, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + (i * 0.1) }}
                          key={i} 
                          className="glass-panel border border-[#C5A059]/40 bg-background/80 backdrop-blur-xl rounded-xl p-3 flex flex-col items-center text-center gap-2 shadow-lg flex-1 min-w-[80px]"
                        >
                          <Activity className="w-5 h-5 text-cyan-500 dark:text-cyan-400 stroke-[1.5]" />
                          <span className="text-[9px] font-semibold text-foreground/90 leading-tight">{b}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side: Texts and Form */}
                  <div className="w-full lg:w-[55%] flex flex-col p-6 sm:p-8 lg:p-12 gap-8 lg:gap-10 relative z-10 bg-background/40">
                    
                    {/* Info de la Clase */}
                    <div className="space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-sm sm:text-base lg:text-lg text-foreground/80 font-light leading-relaxed">
                          {selectedDiscipline.description}
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-4 pt-4 border-t border-border/50"
                      >
                        <Clock className="w-5 h-5 text-[#C5A059]" />
                        <p className="text-foreground text-sm font-medium tracking-wide">{selectedDiscipline.schedule}</p>
                      </motion.div>
                    </div>

                    {/* Formulario (The Form) */}
                    <div className="pt-4">
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C5A059] flex items-center gap-2 mb-5">
                          <Sparkles className="w-3 h-3" />
                          Reserva de Sesión
                        </h4>
                        
                        <form onSubmit={handleBookingSubmit} className="space-y-4 relative z-20">
                          <div>
                            <input 
                              type="text" 
                              required
                              value={bookingName}
                              onChange={(e) => setBookingName(e.target.value)}
                              placeholder="Nombre Completo"
                              className="w-full bg-background/50 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                              type="date" 
                              required
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              className="w-full sm:w-[60%] bg-background/50 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all [color-scheme:dark]"
                            />
                            <button 
                              type="submit" 
                              disabled={bookingStatus === 'loading'}
                              className="w-full sm:w-[40%] bg-gradient-to-r from-[#C5A059] to-[#d4b475] text-[#0A1A12] hover:from-[#d4b475] hover:to-[#C5A059] font-bold uppercase tracking-widest text-[10px] h-auto py-3.5 rounded-xl transition-all shadow-lg shadow-[#C5A059]/20 flex items-center justify-center gap-2 shrink-0"
                            >
                              {bookingStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reservar'}
                            </button>
                          </div>
                        </form>
                        
                        {bookingStatus === 'success' && qrData && (
                          <div className="mt-6 p-4 border border-green-500/30 rounded-xl bg-green-500/10 flex items-center gap-4 animate-in fade-in duration-300">
                            <div className="bg-white p-2 rounded-lg shrink-0">
                              <QRCode value={qrData} size={50} level="M" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-green-600 dark:text-green-400 text-xs uppercase">Pase Generado</p>
                              <p className="text-[10px] text-foreground/70">ID: {qrData}</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>

                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
