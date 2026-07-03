'use client';

import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowRight, Sparkles, Calendar, CheckCircle2,
  Lock, Fingerprint, LayoutDashboard, X, Mail, Phone, MapPin, Facebook, Instagram, Linkedin
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { YogaIcon, TaiChiIcon, BungeeIcon, KangooIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { InfiniteCarousel } from '@/components/site/infinite-carousel';

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
    <span className={`inline-flex flex-wrap justify-center overflow-hidden w-full ${className}`}>
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

const disciplinesData = [
  { 
    icon: YogaIcon, 
    title: "Yoga", 
    subtitle: "Hatha Yoga Zen", 
    desc: "Meditación profunda y posturas fluidas diseñadas para reequilibrar el sistema nervioso en armonía con la naturaleza.",
    image: "/images/yoga-space.png"
  },
  { 
    icon: TaiChiIcon, 
    title: "Tai Chi", 
    subtitle: "Tai Chi Chuan", 
    desc: "El arte de la meditación en movimiento. Canalice su energía vital mediante secuencias simétricas de bajo impacto.",
    image: "/images/taichi-space.png"
  },
  { 
    icon: BungeeIcon, 
    title: "Bungee Jam", 
    subtitle: "Bungee Fitness VIP", 
    desc: "Desafíe la gravedad en suspensión. Entrenamiento aeróbico que cuida sus articulaciones con un control absoluto.",
    image: "/images/bungee-space.png"
  },
  { 
    icon: KangooIcon, 
    title: "Kangu", 
    subtitle: "Kangoo Jumps Pro", 
    desc: "Reactiva la circulación y el tono muscular con botas de rebote patentadas en entrenamientos de alto vigor.",
    image: "/images/kangu-space.png"
  }
];

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [selectedDiscipline, setSelectedDiscipline] = useState<any>(null);
  
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
    <div className="relative bg-transparent text-foreground min-h-screen overflow-x-hidden selection:bg-pampa-oro/20 selection:text-foreground transition-colors duration-700">
      
      {/* Pop-up / Modal para Disciplinas */}
      <AnimatePresence>
        {selectedDiscipline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedDiscipline(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-950 border border-pampa-oro/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10"
            >
              <button 
                onClick={() => setSelectedDiscipline(null)}
                className="absolute top-4 right-4 p-2.5 bg-black/40 hover:bg-pampa-oro hover:text-white rounded-full backdrop-blur-md transition-colors z-20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <Image 
                  src={selectedDiscipline.image} 
                  alt={selectedDiscipline.title} 
                  fill 
                  className="object-cover"
                />
              </div>
              
              <div className="w-full md:w-1/2 p-10 flex flex-col justify-center space-y-6 relative z-10 text-left">
                <div className="text-pampa-oro bg-pampa-oro/10 w-fit p-4 rounded-2xl border border-pampa-oro/20">
                  <selectedDiscipline.icon className="w-10 h-10 stroke-[0.75]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    {selectedDiscipline.subtitle}
                  </span>
                  <h3 className="text-4xl font-serif text-white tracking-tight mt-2">
                    {selectedDiscipline.title}
                  </h3>
                </div>
                <p className="text-base text-white/70 font-light leading-relaxed">
                  {selectedDiscipline.desc}
                </p>
                <div className="pt-6">
                  <Link href="/bienestar" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-pampa-oro text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-pampa-oro transition-colors shadow-lg">
                    Agendar Sesión <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]">
        <div className="absolute left-[10%] top-0 bottom-0 w-px bg-pampa-oro" />
        <div className="absolute right-[10%] top-0 bottom-0 w-px bg-pampa-oro" />
        <div className="absolute left-0 right-0 top-[20%] h-px bg-pampa-oro" />
        <div className="absolute left-0 right-0 top-[60%] h-px bg-pampa-oro" />
      </div>

      <Navbar />

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-32 pb-20 overflow-hidden">
          <div 
            className="absolute inset-0 z-0 hidden dark:block"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          >
            <Image 
              src="/images/hero-spa.png" 
              alt="La Pampa Spa Interior Dark" 
              fill 
              className="object-cover" 
              priority
            />
          </div>
          <div 
            className="absolute inset-0 z-0 dark:hidden"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          >
            <Image 
              src="/images/hero-spa-light.png" 
              alt="La Pampa Spa Interior Light" 
              fill 
              className="object-cover" 
              priority
            />
          </div>
          <div className="absolute inset-0 bg-white/20 dark:bg-background/60 z-0"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20 z-0"></div>

          <div className="max-w-6xl mx-auto text-center space-y-12 z-20 relative w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-panel"
            >
              <Sparkles className="w-3.5 h-3.5 text-pampa-oro" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground drop-shadow-md">
                Santuario de Ultra Lujo
              </span>
            </motion.div>

            <h1 className="text-[4rem] sm:text-[6rem] lg:text-[8.5rem] font-serif leading-[0.9] tracking-tighter select-none drop-shadow-2xl">
              <span className="block font-light italic text-pampa-oro mb-2 sm:mb-6">
                <TextReveal delay={0.1}>la pampa</TextReveal>
              </span>
              <span className="block font-normal uppercase text-foreground">
                <TextReveal delay={0.3}>Santuario</TextReveal>
              </span>
              <span className="block font-normal uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pampa-oro drop-shadow-sm mt-[-0.1em]">
                <TextReveal delay={0.5}>Wellness</TextReveal>
              </span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="max-w-2xl mx-auto text-base sm:text-lg text-foreground/80 font-light leading-relaxed tracking-wide drop-shadow-md"
            >
              Un espacio purificado diseñado para el balance absoluto. Experiencias holísticas y tecnología biométrica integradas para un acceso seguro, fluido e inteligente.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10"
            >
              <MagneticButton className="w-full sm:w-auto">
                <Link 
                  href="#disciplinas"
                  className="w-full sm:w-auto h-14 px-10 rounded-full glass-panel flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 hover:border-pampa-oro transition-all duration-500"
                >
                  <span>Explorar Disciplinas</span>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </section>

        {/* WELLNESS DISCIPLINES PRESENTATION - 2x2 GRID & LEFT IMAGE */}
        <section id="disciplinas" className="py-32 relative bg-background/90 backdrop-blur-2xl border-t border-white/10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Texto y Foto a la izquierda (Desktop) */}
              <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-pampa-oro block mb-4">
                    Disciplinas Exclusivas
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-serif text-foreground drop-shadow-sm">
                    Armonía del <br className="hidden lg:block"/>
                    <span className="font-light italic text-transparent bg-clip-text bg-gradient-to-r from-pampa-oro to-cyan-500">
                      Cuerpo y la Mente
                    </span>
                  </h2>
                </div>
                <div className="hidden lg:block relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-pampa-oro/20 group">
                  <Image src="/images/hero-spa.png" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" alt="Wellness" />
                  <div className="absolute inset-0 bg-cyan-900/10 mix-blend-overlay"></div>
                </div>
              </div>

              {/* Tarjetas Desktop Grid / Mobile Infinite Carousel */}
              <div className="lg:col-span-7">
                
                {/* Mobile Infinite Carousel */}
                <div className="block lg:hidden w-full max-w-sm mx-auto">
                  <InfiniteCarousel items={disciplinesData} onItemClick={setSelectedDiscipline} />
                </div>

                {/* Desktop Grid (No images, text only) */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                  {disciplinesData.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedDiscipline(item)}
                      className="glass-panel bg-white/5 dark:bg-black/20 rounded-2xl overflow-hidden transition-all duration-500 hover:border-pampa-oro/80 hover:shadow-[0_10px_40px_rgba(197,160,89,0.3)] hover:-translate-y-2 cursor-pointer flex flex-col justify-between p-8 border border-pampa-oro/20 group h-full min-h-[320px]"
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="text-pampa-oro p-4 bg-background/80 backdrop-blur-md rounded-2xl w-fit shadow-lg border border-white/5 group-hover:scale-110 transition-transform duration-500">
                            <item.icon className="w-10 h-10 stroke-[0.75]" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 drop-shadow-sm">
                            {item.subtitle}
                          </span>
                          <h3 className="text-3xl font-medium text-foreground font-serif tracking-tight drop-shadow-sm">
                            {item.title}
                          </h3>
                        </div>
                        
                        <p className="text-sm text-foreground/80 font-light leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      
                      <div className="pt-6 flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity border-t border-white/10 mt-6">
                        <span className="text-[10px] uppercase tracking-widest text-pampa-oro font-bold">Abrir Galería</span>
                        <ArrowRight className="w-5 h-5 text-pampa-oro" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-center mt-8 px-4">
            <Link href="/bienestar" className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-pampa-oro/50 text-foreground hover:bg-pampa-oro hover:text-white transition-all duration-500 uppercase text-[10px] tracking-widest font-bold">
              Agendar Sesión Privada
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* BIOMETRIC & MEMBERSHIP GATEWAY FLOW */}
        <section className="py-24 px-4 sm:px-6 bg-background/80 backdrop-blur-3xl border-t border-pampa-oro/20">
          <div className="max-w-6xl mx-auto glass-panel rounded-3xl p-8 sm:p-16 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-pampa-oro block">
                  Seguridad Sin Fricciones
                </span>
                <h2 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight drop-shadow-sm">
                  Acceso Biométrico <br/><span className="text-cyan-600 dark:text-cyan-400 font-light italic">Automatizado</span>
                </h2>
                <p className="text-sm sm:text-base text-foreground/70 font-light leading-relaxed">
                  Nuestra estación de control inteligente está directamente vinculada con la validación de membresía en tiempo real. Al liquidar sus expensas ordinarias, la terminal de reconocimiento facial se activa al instante permitiendo un ingreso fluido e inteligente.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link 
                    href="/biometrico" 
                    className="h-14 px-8 rounded-full bg-pampa-oro text-white flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] hover:bg-foreground transition-colors shadow-lg"
                  >
                    <Fingerprint className="w-5 h-5" />
                    Terminal de Acceso
                  </Link>
                  <Link 
                    href="/admin" 
                    className="h-14 px-8 rounded-full border border-foreground/30 text-foreground flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] hover:bg-foreground/5 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Panel Admin
                  </Link>
                </div>
              </div>

              <div className="relative border border-pampa-oro/30 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[350px] bg-background/40 backdrop-blur-md shadow-2xl">
                <div className="absolute top-4 left-4 text-[10px] font-mono text-pampa-oro/60">SYS-OK-2026</div>
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-pampa-oro/60">V-F-01</div>
                
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-cyan-500/50 flex items-center justify-center text-cyan-500 animate-[spin-slow_10s_linear_infinite] absolute"></div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pampa-oro/20 to-transparent flex items-center justify-center text-pampa-oro relative z-10 animate-pulse">
                  <Fingerprint className="w-12 h-12 stroke-[1]" />
                </div>
                
                <div className="text-center mt-10 space-y-2 z-10 relative">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-foreground">Validación Biométrica Activa</p>
                  <p className="text-[10px] text-cyan-600 dark:text-cyan-400">Sincronización en tiempo real con pasarela</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT & RESERVATIONS */}
        <section id="contacto" className="py-32 px-4 sm:px-6 relative bg-background border-t border-pampa-oro/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-pampa-oro">Atención Preferente</span>
              <h2 className="text-4xl sm:text-5xl font-serif text-foreground drop-shadow-sm">¿NECESITAS ASISTENCIA?</h2>
              <p className="text-sm text-foreground/70 font-light leading-relaxed">Póngase en contacto con nuestro equipo de conserjería o envíenos una solicitud directa.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Contact Channels */}
              <div className="glass-panel rounded-3xl p-8 sm:p-12 relative shadow-2xl space-y-8 h-full flex flex-col">
                <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-foreground border-b border-white/10 pb-4">
                  Canales de Comunicación
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <a href="mailto:administracion@lapampa.test" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-pampa-oro/50 transition-colors group">
                      <Mail className="w-5 h-5 text-pampa-oro" />
                      <div className="overflow-hidden">
                        <span className="block text-[9px] text-foreground/50 uppercase tracking-wider font-bold mb-1">Administración</span>
                        <span className="text-xs text-foreground truncate block">admin@lapampa.test</span>
                      </div>
                    </a>
                    <a href="mailto:concierge@lapampa.test" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-pampa-oro/50 transition-colors group">
                      <Mail className="w-5 h-5 text-pampa-oro" />
                      <div className="overflow-hidden">
                        <span className="block text-[9px] text-foreground/50 uppercase tracking-wider font-bold mb-1">Concierge VIP</span>
                        <span className="text-xs text-foreground truncate block">concierge@lapampa.test</span>
                      </div>
                    </a>
                  </div>
                  
                  <div className="space-y-4">
                    <a href="tel:+593983992549" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-pampa-oro/50 transition-colors group">
                      <Phone className="w-5 h-5 text-pampa-oro" />
                      <div>
                        <span className="block text-[9px] text-foreground/50 uppercase tracking-wider font-bold mb-1">Recepción (24/7)</span>
                        <span className="text-sm font-medium text-foreground">+593 98 399 2549</span>
                      </div>
                    </a>
                    <a href="https://wa.me/593983992549" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors group">
                      <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.938 6.937 0 3.825-3.113 6.938-6.938 6.938z" />
                      </svg>
                      <div>
                        <span className="block text-[9px] text-foreground/50 uppercase tracking-wider font-bold mb-1">WhatsApp</span>
                        <span className="text-sm font-medium text-foreground">+593 98 399 2549</span>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-pampa-oro hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-pampa-oro hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-pampa-oro hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>

                {/* Mapa falso */}
                <div className="mt-auto pt-6 relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 group">
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapPin className="w-8 h-8 text-pampa-oro mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">Abrir en Google Maps</span>
                  </div>
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15959.22724458319!2d-78.4735!3d-0.0898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMMKwMDUnMjMuMyJTIDc4wrBMycOSJzI0LjYiVw!5e0!3m2!1ses!2sec!4v1617200000000!5m2!1ses!2sec" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }} 
                    allowFullScreen 
                    loading="lazy"
                  ></iframe>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="glass-panel rounded-3xl p-8 sm:p-12 relative shadow-2xl h-full">
                <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-foreground border-b border-white/10 pb-4 mb-8 text-center sm:text-left">
                  Déjanos Tu Consulta
                </h3>

                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex flex-col items-center justify-center py-16 space-y-6 bg-cyan-900/10 rounded-2xl border border-cyan-500/20"
                  >
                    <div className="w-16 h-16 bg-cyan-900/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                      <CheckCircle2 className="w-8 h-8 text-cyan-500" />
                    </div>
                    <h3 className="text-xl font-serif text-foreground">Solicitud Enviada</h3>
                    <p className="text-xs text-foreground/70 text-center max-w-xs leading-relaxed">
                      Un asesor se comunicará a la brevedad.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase text-foreground/50 tracking-widest">Nombre Completo</label>
                        <input type="text" required maxLength={80} placeholder="Ej. Juan Pérez" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full h-12 px-4 bg-black/20 border border-white/10 rounded-xl text-foreground placeholder-foreground/30 text-sm focus:outline-none focus:border-pampa-oro transition-colors"/>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase text-foreground/50 tracking-widest">Teléfono</label>
                        <input type="tel" required maxLength={20} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^\d\s\+]/g, ''); }} placeholder="Ej. 099 999 9999" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full h-12 px-4 bg-black/20 border border-white/10 rounded-xl text-foreground placeholder-foreground/30 text-sm focus:outline-none focus:border-pampa-oro transition-colors"/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase text-foreground/50 tracking-widest">Correo Electrónico</label>
                      <input type="email" required maxLength={100} placeholder="tu@correo.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full h-12 px-4 bg-black/20 border border-white/10 rounded-xl text-foreground placeholder-foreground/30 text-sm focus:outline-none focus:border-pampa-oro transition-colors"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase text-foreground/50 tracking-widest">Detalle su requerimiento</label>
                      <textarea rows={3} required maxLength={1000} placeholder="¿En qué le podemos ayudar?" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full p-4 bg-black/20 border border-white/10 rounded-xl text-foreground placeholder-foreground/30 text-sm focus:outline-none focus:border-pampa-oro transition-colors resize-none"/>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full h-14 mt-2 bg-foreground text-background font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-pampa-oro hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50">
                      {loading ? <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <>Enviar Solicitud <ArrowRight className="w-3 h-3" /></>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}