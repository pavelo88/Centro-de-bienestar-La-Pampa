'use client';

import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowRight, Sparkles, Calendar, CheckCircle2,
  Lock, Fingerprint, LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { YogaIcon, TaiChiIcon, BungeeIcon, KangooIcon } from '@/components/icons';

// Magnetic Button effect for premium UX/UI
function MagneticButton({ children, className, ...props }: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 12 });
  const springY = useSpring(y, { stiffness: 120, damping: 12 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    x.set(mouseX * 0.35);
    y.set(mouseY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Text Reveal component for masked titles
function TextReveal({ children, className = '', delay = 0 }: { children: string; className?: string; delay?: number }) {
  const words = children.split(' ');
  return (
    <span className={`inline-flex flex-wrap overflow-hidden ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: delay + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const db = useFirestore();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'contactos_landing'), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        status: 'Pendiente',
        createdAt: serverTimestamp()
      });
      
      setIsSubmitted(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 4000);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('Hubo un error al enviar la solicitud. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-[#FDFBF7] text-[#333333] min-h-screen overflow-x-hidden selection:bg-[#C5A059]/20 selection:text-[#333333] transition-colors duration-700">
      
      {/* Symmetrical fine geometric lines in background for minimalist luxury feel */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]">
        <div className="absolute left-[10%] top-0 bottom-0 w-px bg-[#C5A059]" />
        <div className="absolute right-[10%] top-0 bottom-0 w-px bg-[#C5A059]" />
        <div className="absolute left-0 right-0 top-[20%] h-px bg-[#C5A059]" />
        <div className="absolute left-0 right-0 top-[60%] h-px bg-[#C5A059]" />
      </div>

      <Navbar />

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 pt-40 pb-20">
          <div className="max-w-5xl mx-auto text-center space-y-10 z-20">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A059]/30 bg-[#FDFBF7] shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059]">
                Santuario de Ultra Lujo
              </span>
            </motion.div>

            <h1 className="text-[3.5rem] sm:text-[5.5rem] lg:text-[7.5rem] font-serif leading-[0.95] tracking-tighter select-none">
              <span className="block font-light italic text-[#C5A059] opacity-90">
                <TextReveal delay={0.1}>la pampa</TextReveal>
              </span>
              <span className="block font-normal uppercase text-[#333333] mt-3">
                <TextReveal delay={0.3}>Centro de Bienestar</TextReveal>
              </span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="max-w-xl mx-auto text-sm sm:text-base text-[#777777] font-light leading-relaxed tracking-wide"
            >
              Un espacio purificado diseñado para el balance absoluto. Experiencias holísticas y tecnología biométrica integradas para un acceso seguro, fluido e inteligente.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-8"
            >
              <MagneticButton className="w-full sm:w-auto">
                <Link 
                  href="/portal"
                  className="w-full sm:w-auto h-12 px-8 rounded-none bg-[#333333] text-[#FDFBF7] border border-[#333333] flex items-center justify-center gap-3 font-semibold uppercase tracking-widest text-[9px] hover:bg-transparent hover:text-[#333333] transition-all duration-500"
                >
                  <span>Portal Residentes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </MagneticButton>
              
              <MagneticButton className="w-full sm:w-auto">
                <Link 
                  href="#disciplinas"
                  className="w-full sm:w-auto h-12 px-8 rounded-none border border-[#C5A059] text-[#333333] bg-transparent flex items-center justify-center gap-2 font-semibold uppercase tracking-widest text-[9px] hover:bg-[#C5A059]/5 transition-all duration-500"
                >
                  <span>Explorar Disciplinas</span>
                </Link>
              </MagneticButton>
            </motion.div>

          </div>
        </section>

        {/* WELLNESS DISCIPLINES PRESENTATION */}
        <section id="disciplinas" className="py-32 px-4 sm:px-6 relative border-t border-[#C5A059]/20 bg-[#FDFBF7]">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-24">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] block">
                Disciplinas Exclusivas
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif text-[#333333]">
                Armonía del <span className="font-light italic text-[#C5A059]">Cuerpo y la Mente</span>
              </h2>
              <div className="w-12 h-px bg-[#C5A059] mx-auto mt-6" />
            </div>

            {/* Grid of disciplines using Custom Monoline icons, elegant typography & zero stock images */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { 
                  icon: YogaIcon, 
                  title: "Yoga", 
                  subtitle: "Hatha Yoga Zen", 
                  desc: "Meditación profunda y posturas fluidas diseñadas para reequilibrar el sistema nervioso en armonía con la naturaleza." 
                },
                { 
                  icon: TaiChiIcon, 
                  title: "Tai Chi", 
                  subtitle: "Tai Chi Chuan", 
                  desc: "El arte de la meditación en movimiento. Canalice su energía vital mediante secuencias simétricas de bajo impacto." 
                },
                { 
                  icon: BungeeIcon, 
                  title: "Bungee Jam", 
                  subtitle: "Bungee Fitness VIP", 
                  desc: "Desafíe la gravedad en suspensión. Entrenamiento aeróbico que cuida sus articulaciones con un control absoluto." 
                },
                { 
                  icon: KangooIcon, 
                  title: "Kangu", 
                  subtitle: "Kangoo Jumps Pro", 
                  desc: "Reactiva la circulación y el tono muscular con botas de rebote patentadas en entrenamientos de alto vigor." 
                }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="group bg-[#FDFBF7] border border-[#C5A059]/20 p-8 rounded-none transition-all duration-500 hover:border-[#C5A059] hover:shadow-[0_10px_30px_rgba(197,160,89,0.05)] relative flex flex-col justify-between min-h-[300px]"
                >
                  <div className="space-y-6">
                    <div className="text-[#C5A059] transition-transform duration-500 group-hover:scale-105">
                      <item.icon className="w-10 h-10 stroke-[0.75]" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059]">
                        {item.subtitle}
                      </span>
                      <h3 className="text-xl font-medium text-[#333333] font-serif tracking-tight">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#777777] font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-[#C5A059]/10 mt-6 flex justify-between items-center">
                    <Link href="/bienestar" className="text-[9px] font-bold uppercase tracking-wider text-[#333333] hover:text-[#C5A059] transition-colors flex items-center gap-1.5">
                      Agendar Sesión
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* BIOMETRIC & MEMBERSHIP GATEWAY FLOW */}
        <section className="py-24 px-4 sm:px-6 bg-[#FDFBF7] border-t border-[#C5A059]/20">
          <div className="max-w-5xl mx-auto border border-[#C5A059]/30 p-8 sm:p-16 relative overflow-hidden">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] block">
                  Seguridad Sin Fricciones
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-[#333333] leading-tight">
                  Acceso Biométrico Automatizado
                </h2>
                <p className="text-xs sm:text-sm text-[#777777] font-light leading-relaxed">
                  Nuestra estación de control inteligente está directamente vinculada con la validación de membresía en tiempo real. Al liquidar sus expensas ordinarias, la terminal de reconocimiento facial se activa al instante permitiendo un ingreso automatizado y seguro.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link 
                    href="/biometrico" 
                    className="h-11 px-6 bg-[#C5A059] text-[#FDFBF7] flex items-center justify-center gap-2 font-semibold uppercase tracking-widest text-[9px] hover:bg-[#333333] transition-colors"
                  >
                    <Fingerprint className="w-4 h-4" />
                    Terminal de Acceso
                  </Link>
                  <Link 
                    href="/admin" 
                    className="h-11 px-6 border border-[#333333] text-[#333333] flex items-center justify-center gap-2 font-semibold uppercase tracking-widest text-[9px] hover:bg-[#333333]/5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Panel Administrativo
                  </Link>
                </div>
              </div>

              {/* Symmetrical fine geometric layout as graphic asset */}
              <div className="relative border border-[#C5A059]/20 p-8 flex flex-col items-center justify-center min-h-[250px] bg-[#FDFBF7]">
                <div className="absolute top-2 left-2 text-[9px] font-mono text-[#C5A059]/40">SYS-OK-2026</div>
                <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#C5A059]/40">V-F-01</div>
                
                <div className="w-20 h-20 rounded-full border border-dashed border-[#C5A059] flex items-center justify-center text-[#C5A059] animate-pulse">
                  <Fingerprint className="w-10 h-10 stroke-[0.75]" />
                </div>
                
                <div className="text-center mt-6 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#333333]">Validación Biométrica Activa</p>
                  <p className="text-[9px] text-[#C5A059]">Sincronización en tiempo real con pasarela de pagos</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CONTACT & RESERVATIONS (MINIMALIST FORM) */}
        <section id="contacto" className="py-32 px-4 sm:px-6 relative bg-[#FDFBF7] border-t border-[#C5A059]/20">
          <div className="max-w-4xl mx-auto border border-[#C5A059]/20 p-8 sm:p-16 relative">

            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059]">
                Atención Preferente
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#333333]">
                Agende una Visita Guiada
              </h2>
              <p className="text-xs text-[#777777] font-light leading-relaxed">
                Descubra la exclusividad y los espacios privados diseñados para el bienestar integral.
              </p>
            </div>

            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <CheckCircle2 className="w-12 h-12 text-[#C5A059]" />
                <h3 className="text-lg font-medium text-[#333333]">Solicitud Recibida</h3>
                <p className="text-xs text-[#777777]">Un asesor de nuestro equipo se comunicará con usted en breve.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Nombre Completo</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={80}
                      pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"
                      placeholder="Ej. Alejandro Valenzuela"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 px-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] placeholder-[#777777]/50 text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Teléfono de Contacto</label>
                    <input 
                      type="tel" 
                      required
                      maxLength={20}
                      pattern="^\+?[0-9\s]{7,15}$"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^\d\s\+]/g, '');
                      }}
                      placeholder="Ej. +593 999 999 999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-12 px-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] placeholder-[#777777]/50 text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required 
                    maxLength={100}
                    placeholder="ejemplo@correo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 px-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] placeholder-[#777777]/50 text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Mensaje o Espacio de Interés</label>
                  <textarea 
                    rows={4} 
                    required
                    maxLength={1000}
                    placeholder="Detalles adicionales..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] placeholder-[#777777]/50 text-xs focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                  />
                </div>

                <MagneticButton className="w-full">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#333333] text-[#FDFBF7] border border-[#333333] font-bold uppercase tracking-widest text-[9px] rounded-none hover:bg-transparent hover:text-[#333333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border border-[#FDFBF7] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                        Solicitar Visita
                      </>
                    )}
                  </button>
                </MagneticButton>
              </form>
            )}

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}