'use client';

import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { useState, useEffect } from 'react';
import { 
  Sparkles, MessageSquare, Wrench, 
  DollarSign, QrCode, Plus, Calendar, Clock, 
  ThumbsUp, CheckCircle2, UserCheck, Lock, Gift, Copy 
} from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import AgendaView from '@/components/portal/AgendaView';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { generateDynamicQRToken } from '@/lib/qr-utils';

type UserRole = 'Administrador' | 'Recepción' | 'Contador' | 'Cliente';

interface Post {
  id: string;
  autor: string;
  titulo: string;
  contenido: string;
  categoria: string;
  fecha: any;
  likes: number;
}

interface Ticket {
  id: string;
  areaComun: string;
  descripcion: string;
  estado: 'Pendiente' | 'En proceso' | 'Resuelto';
  fechaCreacion: any;
  fotoUrl?: string;
  reportadoPor: string;
}

interface Expense {
  id: string;
  mes: string;
  monto: number;
  tipo: string;
  estado: 'Pendiente' | 'Pagado';
  vencimiento: string;
}

const initialAnnouncements: Post[] = [
  {
    id: '1',
    autor: 'Administración Wellness La Pampa',
    titulo: 'Servicios de Concierge Premium Activos',
    contenido: 'Para mantener la comodidad de nuestros clientes, el sistema de agendamiento y reserva de disciplinas wellness ya cuenta con confirmación inmediata vía QR.',
    categoria: 'Anuncio',
    fecha: null,
    likes: 12
  },
  {
    id: '2',
    autor: 'Cliente VIP - Plan Black',
    titulo: 'Prácticas de Yoga al Amanecer',
    contenido: 'Estaremos organizando sesiones espontáneas en el deck los sábados a las 6:30 AM. Clientes invitados a unirse para respiración guiada.',
    categoria: 'Social',
    fecha: null,
    likes: 8
  }
];

const initialExpenses: Expense[] = [
  { id: 'exp-1', mes: 'Julio 2026', monto: 250.00, tipo: 'Membresía Black - Mensual', estado: 'Pendiente', vencimiento: '10/07/2026' },
  { id: 'exp-2', mes: 'Junio 2026', monto: 250.00, tipo: 'Membresía Black - Mensual', estado: 'Pagado', vencimiento: '10/06/2026' }
];

export default function ClientPortal() {
  const firebase = useFirebase();
  const db = firebase?.firestore;

  const [userRole, setUserRole] = useState<UserRole>('Cliente');
  const [activeTab, setActiveTab] = useState<string>('finanzas'); // Focus on Finanzas tab first for payment flow
  
  // States
  const [posts, setPosts] = useState<Post[]>(initialAnnouncements);
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 't-1', areaComun: 'Gimnasio Wellness', descripcion: 'Mantenimiento en poleas elípticas.', estado: 'En proceso', reportadoPor: 'Cliente VIP', fechaCreacion: null }
  ]);
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== 'undefined') {
      const localStatus = localStorage.getItem('pampa_membership_payment_status');
      if (localStatus === 'paid') {
        return initialExpenses.map(exp => exp.id === 'exp-1' ? { ...exp, estado: 'Pagado' } : exp);
      }
    }
    return initialExpenses;
  });

  // Form states
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Social');

  // Promociones & Referidos States
  const [referralCode, setReferralCode] = useState('WELLNESS2026-VIP');
  const [copied, setCopied] = useState(false);

  const [newTicketArea, setNewTicketArea] = useState('Gimnasio Wellness');
  const [newTicketDesc, setNewTicketDesc] = useState('');

  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [vipName, setVipName] = useState('');
  const [vipDni, setVipDni] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [qrTimeLeft, setQrTimeLeft] = useState(300);

  // Sync initial payment status with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localStatus = localStorage.getItem('pampa_membership_payment_status');
      if (!localStatus) {
        localStorage.setItem('pampa_membership_payment_status', 'pending');
      }
    }
  }, []);

  // Listeners from Firestore
  useEffect(() => {
    if (!db) return;

    const qPosts = query(collection(db, 'mensajes_foro'), orderBy('fecha', 'desc'));
    const unsubPosts = onSnapshot(qPosts, (snap) => {
      const list: Post[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          autor: data.autor || 'Cliente',
          titulo: data.titulo || '',
          contenido: data.contenido || '',
          categoria: data.categoria || 'Social',
          fecha: data.fecha,
          likes: data.likes || 0
        });
      });
      if (list.length > 0) setPosts(list);
    }, (err) => console.warn("Firestore foro offline, usando mock local"));

    const qTickets = query(collection(db, 'tickets_mantenimiento'), orderBy('fechaCreacion', 'desc'));
    const unsubTickets = onSnapshot(qTickets, (snap) => {
      const list: Ticket[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          areaComun: data.areaComun || '',
          descripcion: data.descripcion || '',
          estado: data.estado || 'Pendiente',
          fechaCreacion: data.fechaCreacion,
          fotoUrl: data.fotoUrl || '',
          reportadoPor: data.reportadoPor || 'Cliente VIP'
        });
      });
      if (list.length > 0) setTickets(list);
    }, (err) => console.warn("Firestore tickets offline, usando mock local"));

    return () => {
      unsubPosts();
      unsubTickets();
    };
  }, [db]);

  // QR timing
  useEffect(() => {
    if (!generatedCode) return;
    const interval = setInterval(() => {
      setQrTimeLeft((prev) => {
        if (prev <= 1) {
          // Generamos un nuevo token dinámico (rotación)
          const newToken = generateDynamicQRToken('cliente_vip_01', vipDni);
          setGeneratedCode(newToken);
          
          if (db) {
            try {
              updateDoc(doc(db, 'accesos_vip', newToken), { updatedAt: serverTimestamp() }).catch(() => {});
            } catch(e) {}
          }
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [generatedCode, vipDni, db]);

  // Actions
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;

    const data = {
      autor: 'Cliente VIP - Plan Black',
      titulo: newPostTitle,
      contenido: newPostContent,
      categoria: newPostCategory,
      fecha: serverTimestamp(),
      likes: 0
    };

    if (db) {
      try {
        await addDoc(collection(db, 'mensajes_foro'), data);
      } catch (err) {
        const post: Post = {
          id: String(Date.now()),
          autor: 'Cliente VIP - Plan Black',
          titulo: newPostTitle,
          contenido: newPostContent,
          categoria: newPostCategory,
          fecha: null,
          likes: 0
        };
        setPosts([post, ...posts]);
      }
    } else {
      const post: Post = {
        id: String(Date.now()),
        autor: 'Cliente VIP - Plan Black',
        titulo: newPostTitle,
        contenido: newPostContent,
        categoria: newPostCategory,
        fecha: null,
        likes: 0
      };
      setPosts([post, ...posts]);
    }

    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleLike = async (postId: string) => {
    if (db) {
      try {
        const docRef = doc(db, 'mensajes_foro', postId);
        await updateDoc(docRef, { likes: increment(1) });
      } catch (err) {
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
    } else {
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketDesc) return;

    const data = {
      areaComun: newTicketArea,
      descripcion: newTicketDesc,
      estado: 'Pendiente' as const,
      fechaCreacion: serverTimestamp(),
      reportadoPor: 'Cliente VIP - Plan Black'
    };

    if (db) {
      try {
        await addDoc(collection(db, 'tickets_mantenimiento'), data);
      } catch (err) {
        setTickets([{ id: String(Date.now()), ...data, fechaCreacion: null }, ...tickets]);
      }
    } else {
      setTickets([{ id: String(Date.now()), ...data, fechaCreacion: null }, ...tickets]);
    }

    setNewTicketDesc('');
  };

  // SINCRO CLAVE: Validar Pago
  const handlePayExpense = (id: string) => {
    setPayingId(id);
    setTimeout(async () => {
      // 1. Update visual list
      setExpenses(expenses.map(exp => exp.id === id ? { ...exp, estado: 'Pagado' } : exp));
      
      // 2. SINCRO LOCALSTORAGE: Mark access as paid for biometric validation
      localStorage.setItem('pampa_membership_payment_status', 'paid');

      // 3. Write log to Firestore to sync admin panel
      if (db) {
        try {
          await addDoc(collection(db, 'registro_pagos'), {
            cliente: 'Cliente VIP - Plan Black',
            monto: 250.00,
            concepto: 'Expensa Ordinaria de Lujo - Julio 2026',
            fechaPago: serverTimestamp()
          });
        } catch (e) {
          console.warn("Error escribiendo pago en Firestore:", e);
        }
      }

      setPayingId(null);
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3000);
    }, 1500);
  };

  // Reset Payment for demo testing
  const handleResetPayment = () => {
    setExpenses(initialExpenses);
    localStorage.setItem('pampa_membership_payment_status', 'pending');
    alert("Simulación reiniciada: Pago pendiente. Acceso biométrico bloqueado.");
  };

  const handleVipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipName || !vipDni) return;

    // Generamos el primer token dinámico (duración 60 segundos antes de rotar)
    const token = generateDynamicQRToken('cliente_vip_01', vipDni);

    if (db) {
      try {
        await addDoc(collection(db, 'accesos_vip'), {
          invitado: vipName,
          documento: vipDni,
          token_inicial: token,
          cliente: 'Cliente VIP - Plan Black',
          fechaCreacion: serverTimestamp(),
          usado: false
        });
      } catch (err) {
        console.warn("Firestore error adding VIP code.", err);
      }
    }

    setGeneratedCode(token);
    setQrTimeLeft(60);
  };

  return (
    <div className="bg-[#FDFBF7] text-[#333333] min-h-screen overflow-x-hidden pt-28 pb-16 selection:bg-[#C5A059]/20 selection:text-[#333333] relative">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-8 mb-12 border-b border-[#C5A059]/20 pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif text-[#333333] uppercase italic">
              Portal del Cliente
            </h1>
            <p className="text-[10px] text-[#C5A059] font-bold tracking-[0.25em] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              Gestión de Membresías y Servicios
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Quick reset button for demo */}
            <button 
              onClick={handleResetPayment}
              className="text-[8px] font-bold tracking-widest uppercase border border-red-200 text-red-500 bg-transparent px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              Reiniciar Expensa (Demo)
            </button>

            <div className="flex items-center gap-2 border border-[#C5A059]/30 px-3 py-1.5 bg-[#FDFBF7]">
              <UserCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <select 
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-[9px] font-bold uppercase tracking-wider text-[#333333] focus:outline-none"
              >
                <option value="Cliente">Vista Cliente</option>
                <option value="Administrador">Vista Administrador</option>
                <option value="Contador">Vista Contador</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#C5A059]/20 pb-4 mb-8">
          {[
            { id: 'finanzas', label: 'Mi Membresía', icon: DollarSign, roles: ['Cliente', 'Contador', 'Administrador'] },
            { id: 'referidos', label: 'Promociones & Referidos', icon: Gift, roles: ['Cliente'] },
            { id: 'comunidad', label: 'Comunidad Wellness', icon: MessageSquare, roles: ['Cliente', 'Administrador'] },
            { id: 'agenda', label: 'Agenda VIP', icon: Calendar, roles: ['Recepción', 'Administrador', 'Cliente'] },
            { id: 'mantenimiento', label: 'Concierge', icon: Wrench, roles: ['Cliente', 'Administrador'] },
            { id: 'vip', label: 'Acceso QR', icon: QrCode, roles: ['Cliente', 'Administrador'] }
          ].filter(tab => tab.roles.includes(userRole)).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                  isActive 
                    ? 'border-[#C5A059] bg-[#FDFBF7] text-[#C5A059] shadow-xs' 
                    : 'border-transparent text-[#777777] hover:text-[#333333]'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
          
          {/* TAB 1: FINANCES & DUES (Auto-access Sync) */}
          {activeTab === 'finanzas' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-4 border border-[#C5A059]/20 p-6 space-y-6">
                <h2 className="text-sm font-bold text-[#333333] uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#C5A059]" />
                  Mi Suscripción
                </h2>

                <div className="p-6 border border-[#C5A059]/30 bg-[#FDFBF7] relative">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#C5A059]">Saldo Pendiente</span>
                  <div className="text-3xl font-light text-[#333333] mt-2">
                    ${expenses.reduce((sum, item) => item.estado === 'Pendiente' ? sum + item.monto : sum, 0).toFixed(2)}
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs border-t border-[#C5A059]/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[#777777] font-bold uppercase text-[9px] tracking-wider">Plan Activo</span>
                    <span className="text-[#333333] font-medium">Membresía Black</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#777777] font-bold uppercase text-[9px] tracking-wider">Estado de Acceso</span>
                    <span className={`font-bold uppercase text-[9px] tracking-wider ${
                      expenses.some(e => e.id === 'exp-1' && e.estado === 'Pendiente') ? 'text-red-500' : 'text-emerald-600'
                    }`}>
                      {expenses.some(e => e.id === 'exp-1' && e.estado === 'Pendiente') ? 'Bloqueado (Mora)' : 'Activo / Autorizado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">Historial de Expensas</h2>
                
                {paymentSuccess && (
                  <div className="p-4 border border-emerald-500/30 bg-emerald-50/50 text-emerald-700 text-xs rounded-none flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>El pago se ha procesado correctamente. Su acceso biométrico ha sido habilitado al instante.</span>
                  </div>
                )}

                <div className="space-y-4">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="border border-[#C5A059]/20 p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#FDFBF7] hover:border-[#C5A059] transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-[#333333]">{exp.mes}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[#777777]">• Vence {exp.vencimiento}</span>
                        </div>
                        <p className="text-[10px] text-[#777777] font-bold uppercase tracking-wider">{exp.tipo}</p>
                      </div>

                      <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#C5A059]/10 pt-4 sm:pt-0">
                        <div className="text-right">
                          <span className="text-[9px] font-bold uppercase text-[#777777] block tracking-wider">Monto</span>
                          <span className="text-base font-semibold text-[#333333]">${exp.monto.toFixed(2)}</span>
                        </div>

                        {exp.estado === 'Pagado' ? (
                          <div className="px-4 py-2 border border-emerald-500/20 bg-emerald-50/50 text-emerald-600 rounded-none text-[9px] font-bold uppercase tracking-widest">
                            Pagado
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePayExpense(exp.id)}
                            disabled={payingId !== null}
                            className="px-6 py-2.5 bg-[#333333] text-[#FDFBF7] border border-[#333333] font-bold uppercase tracking-widest text-[9px] rounded-none hover:bg-transparent hover:text-[#333333] transition-colors flex items-center justify-center"
                          >
                            {payingId === exp.id ? (
                              <span className="w-4 h-4 border border-[#FDFBF7] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              'Liquidar Expensa'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: PROMOCIONES Y REFERIDOS */}
          {activeTab === 'referidos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 border border-[#C5A059]/20 p-6 space-y-6">
                <h2 className="text-sm font-bold text-[#333333] uppercase tracking-wider flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#C5A059]" />
                  Mi Código de Referido
                </h2>

                <div className="p-6 border border-[#C5A059]/30 bg-[#FDFBF7] relative text-center space-y-4">
                  <p className="text-[10px] text-[#777777] font-bold uppercase tracking-wider">
                    Comparte este código para ganar <span className="text-[#C5A059]">15 días gratis</span>
                  </p>
                  
                  <div className="flex items-center justify-between border border-[#C5A059]/20 p-3 bg-white">
                    <span className="font-mono font-bold text-lg text-[#333333] tracking-widest">{referralCode}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(referralCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[#C5A059] hover:text-[#333333] transition-colors"
                      title="Copiar Código"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {copied && <p className="text-emerald-500 text-[10px] font-bold uppercase animate-pulse">¡Copiado al portapapeles!</p>}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">Promociones Activas</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-[#C5A059]/20 p-6 bg-[#FDFBF7] hover:border-[#C5A059] transition-all">
                    <h3 className="text-sm font-bold text-[#333333] uppercase mb-2">Pase 3x2 en Terapias</h3>
                    <p className="text-xs text-[#777777] mb-4">Reserva tres terapias de relajación profunda y paga solo dos durante este mes.</p>
                    <button className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059] border border-[#C5A059] px-4 py-2 hover:bg-[#C5A059] hover:text-white transition-colors">
                      Reclamar Promoción
                    </button>
                  </div>
                  <div className="border border-[#C5A059]/20 p-6 bg-[#FDFBF7] hover:border-[#C5A059] transition-all">
                    <h3 className="text-sm font-bold text-[#333333] uppercase mb-2">Upgrade a Plan Black</h3>
                    <p className="text-xs text-[#777777] mb-4">Realiza el upgrade a tu membresía y obtén un bolso deportivo premium y acceso VIP.</p>
                    <button className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059] border border-[#C5A059] px-4 py-2 hover:bg-[#C5A059] hover:text-white transition-colors">
                      Conoce Más
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FORUM */}
          {activeTab === 'comunidad' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-4 border border-[#C5A059]/20 p-6">
                <h2 className="text-sm font-bold text-[#333333] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#C5A059]" />
                  Publicar en el Foro
                </h2>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Título</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Torneo de Tenis"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="w-full h-11 px-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] text-xs placeholder-[#777777]/50 focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Categoría</label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full h-11 px-4 bg-[#FDFBF7] border border-[#C5A059]/30 rounded-none text-[#333333] text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                    >
                      <option value="Social">Social</option>
                      <option value="Seguridad">Seguridad</option>
                      <option value="Anuncio">Anuncio</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Mensaje</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Redacte su mensaje..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full p-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] text-xs placeholder-[#777777]/50 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-[#333333] text-[#FDFBF7] font-bold uppercase tracking-widest text-[9px] rounded-none hover:bg-transparent hover:text-[#333333] border border-[#333333] transition-colors"
                  >
                    Publicar
                  </button>
                </form>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059]">Mensajes de la Comunidad</h2>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border border-[#C5A059]/20 p-6 hover:border-[#C5A059] transition-all bg-[#FDFBF7]">
                      <div className="flex justify-between items-start gap-4 flex-wrap mb-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 px-2 py-0.5">
                            {post.categoria}
                          </span>
                          <p className="text-[10px] text-[#777777] font-light mt-2">
                            {post.autor} • {post.fecha ? 'Reciente' : 'Hace un momento'}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#C5A059]/20 text-xs font-bold text-[#333333] hover:bg-[#C5A059]/5 transition-all"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>{post.likes}</span>
                        </button>
                      </div>

                      <h3 className="text-lg font-medium text-[#333333] font-serif mb-2">{post.titulo}</h3>
                      <p className="text-xs text-[#777777] font-light leading-relaxed">{post.contenido}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: VISITATION AGENDA */}
          {activeTab === 'agenda' && (
            <div className="animate-in fade-in duration-300">
              <AgendaView userRole={userRole} />
            </div>
          )}

          {/* TAB 4: CONCIERGE TICKET */}
          {activeTab === 'mantenimiento' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-5 border border-[#C5A059]/20 p-6">
                <h2 className="text-sm font-bold text-[#333333] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#C5A059]" />
                  Solicitud de Asistencia
                </h2>
                
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Área Común</label>
                    <select
                      value={newTicketArea}
                      onChange={(e) => setNewTicketArea(e.target.value)}
                      className="w-full h-11 px-4 bg-[#FDFBF7] border border-[#C5A059]/30 rounded-none text-[#333333] text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                    >
                      <option value="Gimnasio Wellness">Gimnasio Wellness</option>
                      <option value="Deck de Yoga">Deck de Yoga</option>
                      <option value="Sauna / Spa">Sauna / Spa</option>
                      <option value="Canchas de Tenis">Canchas de Tenis</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Detalles del Requerimiento</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describa su solicitud..."
                      value={newTicketDesc}
                      onChange={(e) => setNewTicketDesc(e.target.value)}
                      className="w-full p-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] text-xs placeholder-[#777777]/50 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-[#333333] text-[#FDFBF7] font-bold uppercase tracking-widest text-[9px] rounded-none hover:bg-transparent hover:text-[#333333] border border-[#333333] transition-colors"
                  >
                    Enviar Solicitud
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059]">Historial de Solicitudes</h2>
                <div className="space-y-4">
                  {tickets.map((t) => (
                    <div key={t.id} className="border border-[#C5A059]/20 p-6 flex justify-between items-center bg-[#FDFBF7]">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-[#777777]">ID: {t.id.substring(0, 6)}</span>
                        <h4 className="text-base font-medium text-[#333333]">{t.areaComun}</h4>
                        <p className="text-xs text-[#777777] font-light">{t.descripcion}</p>
                      </div>
                      <div className={`px-3 py-1 border text-[8px] font-bold uppercase tracking-widest ${
                        t.estado === 'Resuelto' ? 'border-emerald-500/20 text-emerald-600 bg-emerald-50/35' : 'border-amber-500/20 text-amber-600 bg-amber-50/35'
                      }`}>
                        {t.estado}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: VIP ACCESS */}
          {activeTab === 'vip' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-5 border border-[#C5A059]/20 p-6">
                <h2 className="text-sm font-bold text-[#333333] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#C5A059]" />
                  Generar Invitación VIP
                </h2>
                
                <form onSubmit={handleVipSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Nombre del Invitado</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Roberto Gómez"
                      value={vipName}
                      onChange={(e) => setVipName(e.target.value)}
                      className="w-full h-11 px-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] text-xs placeholder-[#777777]/50 focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Documento (DNI/Cédula)</label>
                    <input
                      type="text"
                      required
                      placeholder="Cédula o pasaporte"
                      value={vipDni}
                      onChange={(e) => setVipDni(e.target.value)}
                      className="w-full h-11 px-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] text-xs placeholder-[#777777]/50 focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-[#333333] text-[#FDFBF7] font-bold uppercase tracking-widest text-[9px] rounded-none hover:bg-transparent hover:text-[#333333] border border-[#333333] transition-colors"
                  >
                    Generar QR VIP
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 border border-[#C5A059]/20 p-8 flex flex-col items-center justify-center min-h-[400px] text-center bg-[#FDFBF7]">
                {generatedCode ? (
                  <div className="space-y-6 w-full max-w-xs">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#C5A059]/30 bg-[#FDFBF7] text-[#C5A059] text-[9px] font-bold uppercase tracking-wider mx-auto">
                      <Lock className="w-3 h-3 text-[#C5A059] animate-pulse" />
                      Pase Autorizado
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-[#333333]">{vipName}</h3>
                      <p className="text-[10px] text-[#777777] font-bold uppercase tracking-wider mt-0.5">DNI: {vipDni}</p>
                    </div>

                    <div className="relative p-6 bg-white border border-[#C5A059]/40 rounded-none mx-auto w-48 h-48 flex items-center justify-center">
                      <QRCodeSVG 
                        value={generatedCode} 
                        size={140}
                        fgColor="#333333"
                        bgColor="#FFFFFF"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-center items-center gap-1.5 text-xs text-[#777777]">
                        <Clock className="w-3.5 h-3.5 text-[#C5A059] animate-spin" style={{ animationDuration: '6s' }} />
                        <span className="font-bold uppercase text-[9px] tracking-wider">Expira en: </span>
                        <span className="text-[#333333] font-bold">
                          {Math.floor(qrTimeLeft / 60)}:{(qrTimeLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-[9px] font-mono text-[#C5A059] uppercase tracking-widest">{generatedCode}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 opacity-50 max-w-sm mx-auto">
                    <QrCode className="w-12 h-12 text-[#C5A059] mx-auto animate-pulse stroke-[0.75]" />
                    <h3 className="text-sm font-bold text-[#333333] uppercase tracking-wider">Esperando generación</h3>
                    <p className="text-xs text-[#777777] font-light leading-relaxed">
                      El código QR de acceso VIP dinámico se generará una vez que complete el formulario.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          </motion.div>
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  );
}
