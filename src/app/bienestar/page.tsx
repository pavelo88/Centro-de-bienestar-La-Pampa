'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, QrCode, User, Check, ChevronRight, Heart } from 'lucide-react';
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
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-pampa-oro">Exclusividades</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-serif text-foreground drop-shadow-sm uppercase italic">
            Clases de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-pampa-oro">Bienestar</span>
          </h1>
          
          <p className="text-base text-foreground/80 font-light leading-relaxed max-w-2xl mx-auto">
            Disfrute de disciplinas diseñadas para el rejuvenecimiento y la vitalidad del cuerpo. Reserve su lugar con confirmación instantánea.
          </p>
        </motion.div>

        {/* Dynamic Class Showcase & Grid Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
          
          {/* List of Disciplines Selector */}
          <div className="lg:col-span-5 space-y-4">
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

          {/* Active Discipline Details */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedDiscipline.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="rounded-[40px] sm:rounded-[60px] shadow-[0_40px_80px_rgba(0,0,0,0.4)] flex flex-col xl:flex-row relative overflow-hidden min-h-[600px] lg:min-h-[700px] border border-white/10 bg-[#0c120c] p-0"
              >
                {/* Lado Izquierdo: Contenido y Textos (Glassmorphism & Earthy) */}
                <div className="w-full xl:w-[55%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative z-10 order-last xl:order-first border-r border-white/5 backdrop-blur-3xl bg-[#0c120c]/60">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#121c13]/80 to-[#0c120c]/90 z-[-1]"></div>

                  <div className="space-y-8 relative z-10">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-between items-start flex-wrap gap-4 pb-4"
                  >
                    <span className="px-5 py-2 bg-white/5 backdrop-blur-xl border border-white/10 text-[#e2cf9f] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
                      {selectedDiscipline.duration}
                    </span>
                    <span className="flex items-center gap-2 text-sm text-[#e2cf9f]/90 font-light bg-white/5 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 shadow-lg">
                      <User className="w-4 h-4 text-[#C5A059]" />
                      {selectedDiscipline.instructor}
                    </span>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-[#f4ecd8] tracking-tight uppercase italic drop-shadow-md leading-[1.1]">
                      {selectedDiscipline.title}
                    </h2>
                    <p className="text-sm sm:text-base text-[#d8dcd6] font-light leading-relaxed max-w-lg">
                      {selectedDiscipline.description}
                    </p>
                  </motion.div>
                  
                  {/* Benefits list */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4 pt-4"
                  >
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#e2cf9f] mb-4">Beneficios Esenciales</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedDiscipline.benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/5 rounded-full text-sm text-[#f4ecd8] hover:border-white/20 transition-all duration-500">
                          <Heart className="w-3.5 h-3.5 text-[#C5A059] shrink-0 stroke-[1.5]" />
                          <span className="font-light">{b}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Horarios info */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-4 p-5 bg-[#121c13]/40 backdrop-blur-2xl border border-[#C5A059]/10 rounded-3xl"
                  >
                    <div className="p-4 bg-[#C5A059]/10 rounded-full text-[#C5A059]">
                      <Clock className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <p className="text-[#C5A059] font-bold uppercase tracking-[0.15em] text-[9px]">Horarios Programados</p>
                      <p className="text-[#f4ecd8] text-lg font-serif italic mt-1">{selectedDiscipline.schedule}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Quick RSVP Form */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 pt-8 border-t border-white/10 relative z-10"
                >
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Reserva Privada de Sesión
                  </h3>
                  <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-5 relative group">
                      <div className="absolute inset-0 bg-[#C5A059] blur-md opacity-0 group-hover:opacity-20 transition-opacity rounded-xl"></div>
                      <input
                        type="text"
                        required
                        placeholder="Nombre Completo"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        className="w-full h-14 px-5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-black/80 transition-all backdrop-blur-md relative z-10"
                      />
                    </div>
                    <div className="sm:col-span-4 relative group">
                      <div className="absolute inset-0 bg-[#C5A059] blur-md opacity-0 group-hover:opacity-20 transition-opacity rounded-xl"></div>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full h-14 px-5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C5A059] focus:bg-black/80 transition-all backdrop-blur-md relative z-10 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        disabled={bookingStatus === 'loading'}
                        className="w-full h-14 bg-gradient-to-r from-[#C5A059] to-[#ebd7a1] text-[#05140b] border-none font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {bookingStatus === 'loading' ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : bookingStatus === 'success' ? (
                          <>
                            <Check className="w-5 h-5" />
                            Listo
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" />
                            Reservar
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {bookingStatus === 'success' && qrData && (
                    <div className="mt-8 p-6 border border-green-500/30 rounded-2xl bg-green-500/10 flex flex-col sm:flex-row items-center gap-6 animate-in zoom-in-95 duration-500 backdrop-blur-md">
                      <div className="bg-white p-3 border border-white/20 rounded-xl shrink-0 shadow-xl">
                        <QRCode value={qrData} size={100} level="H" />
                      </div>
                      <div className="text-center sm:text-left space-y-2">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          <Sparkles className="w-5 h-5 text-green-400 animate-bounce" />
                          <h4 className="font-bold text-green-400 uppercase tracking-wider text-[12px]">¡Sesión Reservada VIP!</h4>
                        </div>
                        <p className="text-xs text-foreground/80 font-light max-w-sm">Su pase ha sido generado. Presente el código QR en la entrada del Wellness Spa.</p>
                        <p className="text-[10px] font-mono text-foreground bg-background/50 inline-block px-3 py-1.5 rounded-md border border-white/10 mt-2">ID: {qrData}</p>
                      </div>
                    </div>
                  )}
                  </motion.div>
                </div>

                {/* Lado Derecho: Imagen Pura y Viva */}
                <div className="w-full xl:w-[45%] h-[300px] xl:h-auto relative z-0 order-first xl:order-last overflow-hidden">
                  <motion.div
                    initial={{ scale: 1.1, opacity: 0, filter: 'blur(10px)' }}
                    animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1], x: [0, -20, 0] }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <Image 
                        src={selectedDiscipline.image} 
                        alt={selectedDiscipline.title} 
                        fill 
                        className="object-cover object-center"
                      />
                    </motion.div>
                    
                    {/* Shadow overlay solo para transición suave en móvil */}
                    <div className="xl:hidden absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05140b] to-transparent"></div>
                  </motion.div>
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
