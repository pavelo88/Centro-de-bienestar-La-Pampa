'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { Sparkles, Heart, Clock, User, Calendar, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import QRCode from 'react-qr-code';
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
    <div className="relative bg-[#FDFBF7] text-[#333333] min-h-screen overflow-x-hidden pt-28 pb-16 selection:bg-[#C5A059]/20 selection:text-[#333333] transition-colors duration-700">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mt-8 mb-20 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A059]/30 bg-[#FDFBF7] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059]">Santuario Wellness & Spa</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-serif text-[#333333] uppercase italic">
            Clases de Bienestar
          </h1>
          
          <p className="text-sm text-[#777777] font-light leading-relaxed max-w-xl mx-auto">
            Disfrute de disciplinas diseñadas para el rejuvenecimiento y la vitalidad del cuerpo. Reserve su lugar con confirmación instantánea.
          </p>
        </motion.div>

        {/* Dynamic Class Showcase & Grid Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          {/* List of Disciplines Selector */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-6">Disciplinas Disponibles</h2>
            <div className="space-y-3">
              {disciplines.map((d) => {
                const isActive = selectedDiscipline.id === d.id;
                const DisciplineIcon = d.icon;
                return (
                  <motion.button
                    key={d.id}
                    onClick={() => setSelectedDiscipline(d)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-6 rounded-none border transition-all duration-500 relative overflow-hidden group ${
                      isActive 
                        ? 'border-[#C5A059] bg-[#FDFBF7] shadow-[0_10px_30px_rgba(197,160,89,0.06)]' 
                        : 'border-[#C5A059]/20 bg-transparent hover:border-[#C5A059]/50'
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 border rounded-none ${isActive ? 'border-[#C5A059] text-[#C5A059]' : 'border-[#C5A059]/20 text-[#777777]'}`}>
                          <DisciplineIcon className="w-6 h-6 stroke-[0.75]" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-bold tracking-widest text-[#C5A059] uppercase">{d.intensity} • {d.duration}</span>
                          <h3 className="text-lg font-medium text-[#333333] font-serif">{d.title}</h3>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-[#C5A059] transition-transform duration-300 ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
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
                className="bg-[#FDFBF7] border border-[#C5A059]/30 rounded-none p-8 sm:p-10 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[500px]"
              >
                <div className="space-y-8 relative z-10">
                  <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[#C5A059]/10 pb-4">
                    <span className="px-3 py-1 border border-[#C5A059]/30 text-[#C5A059] text-[9px] font-bold uppercase tracking-wider">
                      {selectedDiscipline.duration}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#777777] font-light">
                      <User className="w-3.5 h-3.5 text-[#C5A059]" />
                      {selectedDiscipline.instructor}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-serif text-[#333333] tracking-tight uppercase italic">{selectedDiscipline.title}</h2>
                    <p className="text-xs sm:text-sm text-[#777777] font-light leading-relaxed">
                      {selectedDiscipline.description}
                    </p>
                  </div>
                  
                  {/* Benefits list */}
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059]">Beneficios Destacados</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {selectedDiscipline.benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 border border-[#C5A059]/20 rounded-none text-xs text-[#333333]">
                          <Heart className="w-3.5 h-3.5 text-[#C5A059] shrink-0 stroke-[1.5]" />
                          <span className="font-light text-[11px]">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Horarios info */}
                  <div className="flex items-center gap-3 p-4 border border-[#C5A059]/20 rounded-none bg-[#FDFBF7]">
                    <Clock className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <div className="text-xs">
                      <p className="text-[#777777] font-bold uppercase tracking-wider text-[8px]">Horarios Programados</p>
                      <p className="text-[#333333] font-medium mt-0.5">{selectedDiscipline.schedule}</p>
                    </div>
                  </div>
                </div>

                {/* Quick RSVP Form */}
                <div className="mt-8 pt-8 border-t border-[#C5A059]/20 relative z-10">
                  <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-4">Reserva Privada de Sesión</h3>
                  <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-5 relative">
                      <input
                        type="text"
                        required
                        placeholder="Nombre Completo / Lote"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        className="w-full h-11 px-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] placeholder-[#777777]/50 text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-4 relative">
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full h-11 px-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        disabled={bookingStatus === 'loading'}
                        className="w-full h-11 bg-[#333333] text-[#FDFBF7] border border-[#333333] font-bold uppercase tracking-widest text-[9px] rounded-none hover:bg-transparent hover:text-[#333333] transition-colors flex items-center justify-center gap-2"
                      >
                        {bookingStatus === 'loading' ? (
                          <span className="w-4 h-4 border border-[#FDFBF7] border-t-transparent rounded-full animate-spin" />
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
                    <div className="mt-8 p-6 border border-[#C5A059] rounded-none bg-[#FDFBF7] flex flex-col sm:flex-row items-center gap-6 animate-in zoom-in-95 duration-500">
                      <div className="bg-white p-2 border border-[#C5A059]/30 rounded-none shrink-0">
                        <QRCode value={qrData} size={90} level="H" />
                      </div>
                      <div className="text-center sm:text-left space-y-2">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          <Sparkles className="w-4 h-4 text-[#C5A059] animate-bounce" />
                          <h4 className="font-bold text-[#C5A059] uppercase tracking-wider text-[11px]">¡Sesión Reservada VIP!</h4>
                        </div>
                        <p className="text-[11px] text-[#777777] font-light">Su pase ha sido generado. Presente el código QR en la entrada del Wellness Spa.</p>
                        <p className="text-[9px] font-mono text-[#333333] bg-[#C5A059]/10 inline-block px-2.5 py-1">ID: {qrData}</p>
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
