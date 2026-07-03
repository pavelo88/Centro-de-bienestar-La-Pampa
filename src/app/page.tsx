'use client';

import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowRight, Shield, Sparkles, Trees, 
  MapPin, Phone, Mail, Calendar, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';

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
    <div className="relative bg-[#FAF9F6] text-[#062113] dark:bg-[#082117] dark:text-[#E5DED4] min-h-screen overflow-x-hidden selection:bg-[#C5B39C] selection:text-black transition-colors duration-700">
      
      {/* Dynamic Background Glows */}
      <div 
        className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-[#D4AF37]/5 rounded-full blur-[160px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />
      <div 
        className="absolute top-[40%] right-[-20%] w-[70vw] h-[70vw] bg-[#144229]/20 rounded-full blur-[180px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{ transform: `translateY(${scrollY * -0.1}px)` }}
      />

      <Navbar />

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-32 pb-20">
          <div className="max-w-6xl mx-auto text-center space-y-8 z-20">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#062113]/5 border border-[#062113]/10 dark:bg-white/5 dark:border-white/10 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C5B39C]">
                Santuario Residencial Privado
              </span>
            </motion.div>

            <h1 className="text-[3rem] sm:text-[5rem] lg:text-[7.5rem] font-serif leading-[0.9] tracking-tight select-none">
              <span className="block font-light italic opacity-85">
                <TextReveal delay={0.1}>La Pampa</TextReveal>
              </span>
              <span className="block font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#062113] via-[#D4AF37] to-[#062113] dark:from-[#FAF9F6] dark:via-[#DFD3C3] dark:to-[#D4AF37] mt-2">
                <TextReveal delay={0.3}>El Mejor Barrio</TextReveal>
              </span>
              <span className="block font-light italic text-[#C5B39C] mt-2">
                <TextReveal delay={0.5}>del Mundo</TextReveal>
              </span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="max-w-2xl mx-auto text-sm sm:text-base text-slate-700 dark:text-slate-300 font-light leading-relaxed tracking-wide"
            >
              Ubicado en el exclusivo valle de Pomasqui, un entorno country club rodeado de naturaleza majestuosa, seguridad privada de nivel absoluto y confort cinco estrellas.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6"
            >
              <MagneticButton className="w-full sm:w-auto">
                <Link 
                  href="/portal"
                  className="w-full sm:w-auto h-14 px-8 rounded-full bg-gradient-to-r from-[#144229] to-[#0b2616] text-[#E5DED4] border border-[#D4AF37]/50 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] shadow-[0_4px_25px_rgba(20,66,41,0.4)] hover:shadow-[0_4px_35px_rgba(20,66,41,0.6)] transition-all duration-500 group"
                >
                  <span>Acceder al Portal</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
              
              <MagneticButton className="w-full sm:w-auto">
                <Link 
                  href="#entorno"
                  className="w-full sm:w-auto h-14 px-8 rounded-full bg-[#062113]/5 border border-[#062113]/10 text-[#062113] dark:bg-white/5 dark:border-white/10 dark:text-white flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] hover:bg-[#062113]/10 dark:hover:bg-white/10 transition-all duration-500"
                >
                  <span>Explorar Entorno</span>
                </Link>
              </MagneticButton>
            </motion.div>

          </div>

          {/* Interactive Parallax Background Image */}
          <div 
            className="absolute inset-0 -z-10 w-full h-full opacity-35 transition-transform duration-500 ease-out"
            style={{ transform: `scale(${1 + scrollY * 0.0005}) translateY(${scrollY * 0.1}px)` }}
          >
            <img 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600" 
              alt="Mansión de lujo La Pampa" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6]/40 to-[#FAF9F6] dark:from-[#082117] dark:via-[#082117]/40 dark:to-[#082117]" />
          </div>

        </section>

        {/* ENTORNO & AMENIDADES (GRID PARALLAX) */}
        <section id="entorno" className="py-32 px-4 sm:px-6 relative border-t border-white/5 bg-white/60 dark:bg-[#030d07]/60 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-24">
              <div className="lg:col-span-5 space-y-6">
                <span className="text-[10px] font-black tracking-[0.25em] uppercase text-[#D4AF37] block">
                  Estilo de Vida Excepcional
                </span>
                <h2 className="text-4xl sm:text-6xl font-serif text-[#062113] dark:text-white leading-tight">
                  Un santuario rodeado de <span className="font-light italic text-[#C5B39C]">naturaleza y distinción</span>
                </h2>
                <p className="text-slate-700 dark:text-slate-400 font-light text-sm sm:text-base leading-relaxed">
                  La Pampa redefine el concepto de comunidad de ultra-lujo. Extensos campos verdes, seguridad biométrica, canchas privadas y un centro wellness 5 estrellas se integran en un microclima cálido único en el norte de Quito.
                </p>
              </div>

              {/* Parallax Image Collage */}
              <div className="lg:col-span-7 grid grid-cols-12 gap-4 relative">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="col-span-8 rounded-[2rem] overflow-hidden aspect-video relative shadow-2xl"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" 
                    alt="Club de Campo" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  className="col-span-4 rounded-[1.5rem] overflow-hidden aspect-square relative shadow-2xl mt-12"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600" 
                    alt="Wellness Club" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </div>

            {/* Premium Amenity Cards with Framer Motion hover & floats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: Shield, 
                  title: "Seguridad Absoluta", 
                  desc: "Control biométrico facial en garitas y monitoreo perimetral activo 24/7.", 
                  tag: "Protección" 
                },
                { 
                  icon: Trees, 
                  title: "Áreas Verdes Infinitas", 
                  desc: "Parques arbolados, senderos ecológicos y paisajes diseñados por arquitectos paisajistas.", 
                  tag: "Naturaleza" 
                },
                { 
                  icon: Sparkles, 
                  title: "Club House & Wellness", 
                  desc: "Gimnasio de última tecnología, saunas secas y húmedas, y canchas deportivas de primer nivel.", 
                  tag: "Bienestar" 
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group bg-[#062113]/5 dark:bg-[#0b2616]/30 border border-[#062113]/10 dark:border-white/5 rounded-[2.5rem] p-8 hover:border-[#D4AF37]/30 transition-all duration-700 backdrop-blur-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
                    {item.tag}
                  </span>
                  <item.icon className="w-10 h-10 text-[#C5B39C] mt-8 mb-6 group-hover:scale-110 group-hover:text-[#062113] dark:group-hover:text-white transition-all duration-500" />
                  <h3 className="text-xl font-bold text-[#062113] dark:text-white mb-3">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 font-light leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* CONTACT & RESERVATIONS (MINIMALIST FORM) */}
        <section id="contacto" className="py-32 px-4 sm:px-6 relative bg-transparent">
          <div className="max-w-4xl mx-auto bg-white/70 dark:bg-[#0b2616]/30 border border-[#062113]/10 dark:border-white/10 rounded-[3rem] p-8 sm:p-12 md:p-16 backdrop-blur-xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
              <span className="text-[10px] font-black tracking-[0.25em] uppercase text-[#D4AF37]">
                Atención Preferente
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif text-[#062113] dark:text-white">
                Agende una Visita Privada
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 font-light leading-relaxed">
                Descubra la exclusividad y los lotes premium disponibles en la urbanización más cotizada de Pomasqui.
              </p>
            </div>

            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <CheckCircle2 className="w-16 h-16 text-[#D4AF37]" />
                <h3 className="text-xl font-bold text-white">Solicitud Recibida</h3>
                <p className="text-xs text-slate-400">Un asesor concierge se comunicará con usted en menos de 24 horas.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#C5B39C] tracking-widest">Nombre Completo</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={80}
                      pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"
                      placeholder="Ej. Alejandro Valenzuela"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 px-4 bg-slate-100/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-foreground placeholder-slate-500 text-xs focus:outline-none focus:border-pampa-oro transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#C5B39C] tracking-widest">Teléfono de Contacto</label>
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
                      className="w-full h-12 px-4 bg-slate-100/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-foreground placeholder-slate-500 text-xs focus:outline-none focus:border-pampa-oro transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-[#C5B39C] tracking-widest">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required 
                    maxLength={100}
                    placeholder="ejemplo@correo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-100/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-foreground placeholder-slate-500 text-xs focus:outline-none focus:border-pampa-oro transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-[#C5B39C] tracking-widest">Mensaje o Detalles del Lote de Interés</label>
                  <textarea 
                    rows={4} 
                    required
                    maxLength={1000}
                    placeholder="Escriba aquí sus comentarios..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 bg-slate-100/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-foreground placeholder-slate-500 text-xs focus:outline-none focus:border-pampa-oro transition-colors resize-none"
                  />
                </div>

                <MagneticButton className="w-full">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-[#144229] to-[#0b2616] border border-[#D4AF37]/50 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#0b2616] hover:border-[#D4AF37] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                        Solicitar Cita
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