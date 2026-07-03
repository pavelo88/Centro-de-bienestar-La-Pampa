'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { Sparkles, Heart, Clock, User, Calendar, Check, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import QRCode from 'react-qr-code';

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
}

const disciplines: Discipline[] = [
  {
    id: 'yoga',
    title: 'Hatha Yoga Zen',
    intensity: 'Suave / Meditación',
    duration: '75 min',
    instructor: 'Yogui Master Anand (India)',
    schedule: 'Lunes a Jueves • 07:00 & 18:30',
    description: 'Encuentre balance absoluto conectando cuerpo y mente a través del Hatha Yoga. Sesiones holísticas diseñadas para calmar el sistema nervioso en nuestro deck rodeado de eucaliptos.',
    benefits: ['Reduce cortisol', 'Alineación postural', 'Fuerza isométrica'],
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'tai-chi',
    title: 'Tai Chi Chuan',
    intensity: 'Bajo Impacto / Fluido',
    duration: '60 min',
    instructor: 'Shifu Wu Chen (China)',
    schedule: 'Martes & Viernes • 08:30',
    description: 'Meditación en movimiento. Mejore su balance, flexibilidad y canalización del Qi en una experiencia armoniosa de bajo impacto ideal para todas las edades.',
    benefits: ['Balance físico', 'Estimulación del Qi', 'Flexibilidad articular'],
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'bungee',
    title: 'Bungee Fitness VIP',
    intensity: 'Alto Impacto / Cardio',
    duration: '50 min',
    instructor: 'Coach Valeria Gómez (Colombia)',
    schedule: 'Miércoles & Sábado • 09:30',
    description: 'Entrenamiento de resistencia suspendido. Experimente la gravedad cero, flote en el aire y active su núcleo en una sesión estimulante que desafía las articulaciones tradicionales.',
    benefits: ['Quema de 700 kcal', 'Cero impacto articular', 'Fuerza explosiva core'],
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'kangoo',
    title: 'Kangoo Jumps Pro',
    intensity: 'Extremo / Divertido',
    duration: '45 min',
    instructor: 'Instructor Daniel Cifuentes',
    schedule: 'Lunes a Viernes • 19:30',
    description: 'Cardio de alta densidad a través de botas de rebote patentadas. Estimule el drenaje linfático, tonifique glúteos y libere dopamina saltando al ritmo de música clubbing exclusiva.',
    benefits: ['Drenaje linfático', 'Absorción de impacto', 'Alta liberación de dopamina'],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600'
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
      const docRef = await addDoc(collection(db, 'reservas_wellness'), {
        disciplina: selectedDiscipline.title,
        disciplinaId: selectedDiscipline.id,
        nombre: bookingName,
        fechaReserva: bookingDate,
        createdAt: serverTimestamp()
      });
      
      const payload = `PampaVIP-${docRef.id.substring(0, 8).toUpperCase()}-${selectedDiscipline.id}`;
      setQrData(payload);
      setBookingStatus('success');
      
      // Auto-reset after some time or let them download it
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
    <div className="relative bg-[#FAF9F6] text-[#062113] dark:bg-[#082117] dark:text-[#E5DED4] min-h-screen overflow-x-hidden pt-28 pb-16 selection:bg-[#C5B39C] selection:text-black transition-colors duration-700">
      <Navbar />

      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#144229]/20 blur-[150px] rounded-full pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mt-8 mb-20 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#062113]/5 border border-[#062113]/10 dark:bg-white/5 dark:border-white/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span className="text-xs font-black tracking-[0.25em] uppercase text-[#C5B39C]">Oasis de Bienestar Exclusivo</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-serif text-[#062113] dark:text-white uppercase italic">
            Wellness Center & Spa 5 Estrellas
          </h1>
          
          <p className="text-sm sm:text-base text-slate-700 dark:text-[#C5B39C] font-light leading-relaxed">
            Un santuario exclusivo de relajación, paz y vitalidad diseñado para los copropietarios de la Urbanización La Pampa. Disfrute de experiencias holísticas de spa, clases personalizadas de Yoga y Tai Chi, y entrenamientos de alta energía como Bungee Fitness y Kangoo Jumps.
          </p>
        </motion.div>

        {/* Dynamic Class Showcase & Grid Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          
          {/* List of Disciplines Selector */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#C5B39C] mb-6">Disciplinas Disponibles</h2>
            <div className="space-y-4">
              {disciplines.map((d) => {
                const isActive = selectedDiscipline.id === d.id;
                return (
                  <motion.button
                    key={d.id}
                    onClick={() => setSelectedDiscipline(d)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group ${
                      isActive 
                        ? 'bg-gradient-to-br from-[#144229]/95 to-[#05140b]/98 border-[#D4AF37] text-white shadow-[0_10px_40px_rgba(20,66,41,0.3)]' 
                        : 'bg-[#062113]/5 dark:bg-white/5 border-[#062113]/10 dark:border-white/5 text-[#062113] dark:text-[#E5DED4] hover:border-white/20 hover:bg-[#062113]/10 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5B39C]/5 blur-2xl rounded-full transition-opacity opacity-0 group-hover:opacity-100" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black tracking-widest text-[#C5B39C] uppercase">{d.intensity} • {d.duration}</span>
                        <h3 className={`text-xl font-bold transition-colors ${isActive ? 'text-white' : 'text-[#062113] dark:text-white'}`}>{d.title}</h3>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-[#C5B39C] transition-transform duration-300 ${isActive ? 'rotate-90 text-white' : 'group-hover:translate-x-1'}`} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Active Discipline Details inside AnimatePresence for transition animations */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedDiscipline.id}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="bg-white dark:bg-[#0b2616]/40 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 sm:p-10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden group min-h-[500px]"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: `url(${selectedDiscipline.image})` }} />
                
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <span className="px-4 py-1.5 rounded-full bg-[#C5B39C]/10 text-[#C5B39C] text-xs font-black uppercase tracking-wider border border-[#C5B39C]/20">
                      {selectedDiscipline.duration}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <User className="w-4 h-4 text-[#D4AF37]" />
                      {selectedDiscipline.instructor}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-serif text-[#062113] dark:text-white tracking-tight uppercase italic">{selectedDiscipline.title}</h2>
                  
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-light leading-relaxed">
                    {selectedDiscipline.description}
                  </p>

                  {/* Benefits list */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C5B39C]">Beneficios Destacados</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {selectedDiscipline.benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 text-xs text-[#062113] dark:text-white">
                          <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Horarios info */}
                  <div className="flex items-center gap-3 p-4 bg-[#062113]/5 dark:bg-[#062113]/60 rounded-2xl border border-[#C5B39C]/20">
                    <Clock className="w-5 h-5 text-[#C5B39C] shrink-0" />
                    <div className="text-xs">
                      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px]">Horarios Programados</p>
                      <p className="text-[#062113] dark:text-white font-black">{selectedDiscipline.schedule}</p>
                    </div>
                  </div>
                </div>

                {/* Quick RSVP Form inside active view */}
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10 relative z-10">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C5B39C] mb-4">Reserva Privada de Sesión</h3>
                  <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-5 relative">
                      <input
                        type="text"
                        required
                        placeholder="Nombre Completo / Lote"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        className="w-full h-12 px-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#062113] dark:text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#C5B39C] transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-4 relative">
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full h-12 px-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#062113] dark:text-white text-xs focus:outline-none focus:border-[#C5B39C] transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        disabled={bookingStatus === 'loading'}
                        className="w-full h-12 bg-[#144229] hover:bg-[#0b2616] text-white border border-[#D4AF37]/50 font-black uppercase tracking-widest text-[10px] rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {bookingStatus === 'loading' ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : bookingStatus === 'success' ? (
                          <>
                            <Check className="w-4 h-4" />
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
                    <div className="mt-8 p-6 bg-[#05140b]/80 border border-[#D4AF37]/30 rounded-2xl flex flex-col sm:flex-row items-center gap-6 animate-in zoom-in-95 duration-500">
                      <div className="bg-white p-3 rounded-xl shrink-0">
                        <QRCode value={qrData} size={100} level="H" />
                      </div>
                      <div className="text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                          <Sparkles className="w-4 h-4 text-[#D4AF37] animate-bounce" />
                          <h4 className="font-bold text-[#D4AF37]">¡Sesión Reservada VIP!</h4>
                        </div>
                        <p className="text-xs text-slate-300 mb-3">Este es su pase exclusivo. Preséntelo en recepción desde su celular o descárguelo.</p>
                        <p className="text-[10px] font-mono text-[#C5B39C] bg-[#144229]/50 inline-block px-2 py-1 rounded">ID: {qrData}</p>
                      </div>
                    </div>
                  )}
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
