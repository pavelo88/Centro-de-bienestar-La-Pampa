'use client';

import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { useState, useEffect } from 'react';
import { 
  Sparkles, MessageSquare, Wrench, ShieldCheck, 
  DollarSign, QrCode, Plus, Calendar, Clock, 
  ThumbsUp, AlertCircle, FileText, Camera, 
  ChevronRight, Lock, CheckCircle2, UserCheck 
} from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import AgendaView from '@/components/portal/AgendaView';

type UserRole = 'Administrador' | 'Guardia' | 'Contador' | 'Residente';

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
    autor: 'Administración - La Pampa II',
    titulo: 'Instalación de Fibra Óptica Simétrica Subterránea',
    contenido: 'Con el objetivo de mantener la excelencia tecnológica en nuestra urbanización, se ha completado la canalización e instalación de la nueva red de fibra subterránea FTTH.',
    categoria: 'Anuncio',
    fecha: null,
    likes: 32
  },
  {
    id: '2',
    autor: 'Familia Ortega - Lote 14',
    titulo: 'Torneo Abierto de Tenis de Verano',
    contenido: 'Este fin de semana organizaremos el tradicional torneo abierto en el Club de la urbanización. Contaremos con refrigerios premium y trofeos para los finalistas.',
    categoria: 'Social',
    fecha: null,
    likes: 18
  },
  {
    id: '3',
    autor: 'Comité de Seguridad',
    titulo: 'Simulacro de Seguridad e Integración con Central de Control',
    contenido: 'El próximo martes a las 11:00 realizaremos el test de alertas tempranas con respuesta rápida de patrullas motorizadas.',
    categoria: 'Seguridad',
    fecha: null,
    likes: 12
  }
];

const initialExpenses: Expense[] = [
  { id: 'exp-1', mes: 'Julio 2026', monto: 250.00, tipo: 'Expensa Ordinaria de Lujo', estado: 'Pendiente', vencimiento: '10/07/2026' },
  { id: 'exp-2', mes: 'Junio 2026', monto: 250.00, tipo: 'Expensa Ordinaria de Lujo', estado: 'Pagado', vencimiento: '10/06/2026' },
  { id: 'exp-3', mes: 'Mayo 2026', monto: 350.00, tipo: 'Fondo de Inversión Paisajista', estado: 'Pagado', vencimiento: '10/05/2026' },
  { id: 'exp-4', mes: 'Abril 2026', monto: 250.00, tipo: 'Expensa Ordinaria de Lujo', estado: 'Pagado', vencimiento: '10/04/2026' }
];

export default function ResidentPortal() {
  const firebase = useFirebase();
  const db = firebase?.firestore;
  const storage = firebase?.storage;

  const [userRole, setUserRole] = useState<UserRole>('Residente');
  const [activeTab, setActiveTab] = useState<string>('comunidad');
  
  // Realtime lists from Firestore with fallbacks
  const [posts, setPosts] = useState<Post[]>(initialAnnouncements);
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 't-1', areaComun: 'Gimnasio Wellness', descripcion: 'Mantenimiento preventivo en poleas elípticas.', estado: 'En proceso', fechaCreacion: null, fotoUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=300', reportadoPor: 'Lote 12' },
    { id: 't-2', areaComun: 'Piscina del Resort', descripcion: 'Filtro climatizador ajustado a 27°C.', estado: 'Resuelto', fechaCreacion: null, fotoUrl: '', reportadoPor: 'Lote 05' }
  ]);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  // New item states
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Social');

  const [newTicketArea, setNewTicketArea] = useState('Gimnasio Wellness');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [uploadingProgress, setUploadingProgress] = useState(-1);

  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [vipName, setVipName] = useState('');
  const [vipDni, setVipDni] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [qrTimeLeft, setQrTimeLeft] = useState(300);

  // Realtime sync from Firestore
  useEffect(() => {
    if (!db) return;

    // 1. Forum Messages listener
    const qPosts = query(collection(db, 'mensajes_foro'), orderBy('fecha', 'desc'));
    const unsubPosts = onSnapshot(qPosts, (snap) => {
      const list: Post[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          autor: data.autor || 'Propietario',
          titulo: data.titulo || '',
          contenido: data.contenido || '',
          categoria: data.categoria || 'Social',
          fecha: data.fecha,
          likes: data.likes || 0
        });
      });
      if (list.length > 0) {
        setPosts(list);
      }
    }, (err) => console.warn("Foro Firestore falló (permisos). Usando mock data local.", err));

    // 2. Tickets listener
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
          reportadoPor: data.reportadoPor || 'Lote 05'
        });
      });
      if (list.length > 0) {
        setTickets(list);
      }
    }, (err) => console.warn("Tickets Firestore falló (permisos). Usando mock data local.", err));

    return () => {
      unsubPosts();
      unsubTickets();
    };
  }, [db]);

  // QR Time interval
  useEffect(() => {
    if (!generatedCode) return;
    const interval = setInterval(() => {
      setQrTimeLeft((prev) => {
        if (prev <= 1) {
          setGeneratedCode(`VIP-${vipDni}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [generatedCode, vipDni]);

  // Submit Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;

    const data = {
      autor: 'Lote 05 - Familia Ortega',
      titulo: newPostTitle,
      contenido: newPostContent,
      categoria: newPostCategory,
      fecha: serverTimestamp(),
      likes: 0
    };

    // Attempt Firestore write
    if (db) {
      try {
        await addDoc(collection(db, 'mensajes_foro'), data);
      } catch (err) {
        console.warn("Error escribiendo foro. Guardando en estado local.", err);
        const post: Post = {
          id: String(Date.now()),
          autor: 'Lote 05 - Familia Ortega',
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
        autor: 'Lote 05 - Familia Ortega',
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

  // Like Post
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

  // Submit Ticket with real Storage upload if possible
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketDesc) return;

    let finalUrl = '';

    if (ticketFile && storage) {
      setUploadingProgress(10);
      try {
        const fileRef = ref(storage, `mantenimiento/${Date.now()}-${ticketFile.name}`);
        const uploadTask = uploadBytesResumable(fileRef, ticketFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadingProgress(progress);
            }, 
            (error) => reject(error), 
            async () => {
              finalUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } catch (err) {
        console.warn("Storage upload failed. Fallback to placeholder image.", err);
        finalUrl = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300';
      }
    } else if (ticketFile) {
      // Offline/Local Simulation progress bar
      setUploadingProgress(10);
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          setUploadingProgress((p) => {
            if (p >= 100) {
              clearInterval(interval);
              finalUrl = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300';
              resolve();
              return 100;
            }
            return p + 30;
          });
        }, 200);
      });
    }

    const data = {
      areaComun: newTicketArea,
      descripcion: newTicketDesc,
      estado: 'Pendiente' as const,
      fechaCreacion: serverTimestamp(),
      fotoUrl: finalUrl,
      reportadoPor: 'Lote 05 - Familia Ortega'
    };

    if (db) {
      try {
        await addDoc(collection(db, 'tickets_mantenimiento'), data);
      } catch (err) {
        console.warn("Error escribiendo ticket. Guardando localmente.", err);
        setTickets([{
          id: String(Date.now()),
          ...data,
          fechaCreacion: null
        }, ...tickets]);
      }
    } else {
      setTickets([{
        id: String(Date.now()),
        ...data,
        fechaCreacion: null
      }, ...tickets]);
    }

    setNewTicketDesc('');
    setTicketFile(null);
    setUploadingProgress(-1);
  };

  // Pay Expense
  const handlePayExpense = (id: string) => {
    setPayingId(id);
    setTimeout(() => {
      setExpenses(expenses.map(exp => exp.id === id ? { ...exp, estado: 'Pagado' } : exp));
      setPayingId(null);
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3000);
    }, 2000);
  };

  // VIP Pass Submit
  const handleVipGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipName || !vipDni) return;

    const token = `VIP-${vipDni}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    if (db) {
      try {
        await addDoc(collection(db, 'accesos_vip'), {
          invitado: vipName,
          documento: vipDni,
          token,
          residente: 'Lote 05',
          fechaCreacion: serverTimestamp(),
          usado: false
        });
      } catch (err) {
        console.warn("Firestore error adding VIP code.", err);
      }
    }

    setGeneratedCode(token);
    setQrTimeLeft(300);
  };

  return (
    <div className="bg-[#05140b] text-[#E5DED4] min-h-screen overflow-x-hidden pt-28 pb-16 selection:bg-[#C5B39C] selection:text-black relative">
      {/* Decorative luxury gradient background glows */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[#144229]/20 rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-8 mb-12 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white italic">
              Portal La Pampa
            </h1>
            <p className="text-xs text-[#C5B39C] font-semibold tracking-[0.25em] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              Urbanización La Pampa • Accesos y Gestión
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            {/* TEMPORARY ROLE SWITCHER FOR TESTING */}
            <div className="flex items-center gap-2 bg-[#144229]/50 border border-[#D4AF37]/30 px-3 py-1.5 rounded-2xl">
              <UserCheck className="w-4 h-4 text-[#D4AF37]" />
              <select 
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-[10px] font-black uppercase tracking-wider text-white focus:outline-none"
              >
                <option className="bg-[#05140b]" value="Residente">Vista Residente</option>
                <option className="bg-[#05140b]" value="Guardia">Vista Guardia</option>
                <option className="bg-[#05140b]" value="Contador">Vista Contador</option>
                <option className="bg-[#05140b]" value="Administrador">Vista Administrador</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
              <div className="text-[10px] font-black uppercase tracking-wider">
                <span className="text-[#C5B39C]">{userRole}: </span>
                <span className="text-white">Sesión Activa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom luxury tab selector */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 p-2 bg-[#0b2616]/40 border border-white/10 rounded-[2.5rem] mb-12 backdrop-blur-xl">
          {[
            { id: 'comunidad', label: 'Comunidad', icon: MessageSquare, roles: ['Residente', 'Administrador'] },
            { id: 'agenda', label: 'Agenda y Visitas', icon: Calendar, roles: ['Guardia', 'Administrador', 'Residente'] },
            { id: 'mantenimiento', label: 'Concierge', icon: Wrench, roles: ['Residente', 'Administrador'] },
            { id: 'finanzas', label: 'Finanzas', icon: DollarSign, roles: ['Residente', 'Contador', 'Administrador'] },
            { id: 'vip', label: 'Acceso VIP QR', icon: QrCode, roles: ['Residente', 'Administrador'] }
          ].filter(tab => tab.roles.includes(userRole)).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center gap-3 py-4 rounded-[2rem] text-xs font-black uppercase tracking-wider transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isActive 
                    ? 'bg-[#144229] text-[#E5DED4] border border-[#D4AF37]/50 shadow-[0_4px_20px_rgba(20,66,41,0.5)]' 
                    : 'text-[#C5B39C]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#C5B39C]/70'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* AGENDA VIEW */}
          {activeTab === 'agenda' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <AgendaView userRole={userRole} />
            </div>
          )}

          {/* A. COMMUNITY BLOC (FORUM) */}
          {activeTab === 'comunidad' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Write new message */}
              <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl h-fit">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#C5B39C]" />
                  Publicar Anuncio
                </h2>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#C5B39C] tracking-widest">Título</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Torneo Infantil de Natación"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#C5B39C] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#C5B39C] tracking-widest">Categoría</label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full h-12 px-4 bg-[#090D0A] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#C5B39C] transition-colors"
                    >
                      <option value="Social">Social</option>
                      <option value="Seguridad">Seguridad</option>
                      <option value="Anuncio">Anuncio</option>
                      <option value="Servicio">Servicio</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#C5B39C] tracking-widest">Detalle del Mensaje</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Redacte su anuncio..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#C5B39C] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#C5B39C] transition-colors"
                  >
                    Publicar
                  </button>
                </form>
              </div>

              {/* Forum list */}
              <div className="lg:col-span-8 space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#C5B39C]">Mensajes Recientes</h2>
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl transition-all hover:border-[#C5B39C]/30 relative overflow-hidden group">
                      <div className="flex justify-between items-start gap-4 flex-wrap mb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#C5B39C] bg-[#C5B39C]/10 border border-[#C5B39C]/20 px-3 py-1 rounded-full">
                            {post.categoria}
                          </span>
                          <p className="text-xs text-slate-400 font-bold mt-2">
                            {post.autor} • {post.fecha ? (post.fecha.toDate ? post.fecha.toDate().toLocaleDateString() : 'Hoy') : 'Hace un momento'}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-all text-xs font-black text-white hover:scale-105 active:scale-95 animate-in fade-in"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{post.likes}</span>
                        </button>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3">{post.titulo}</h3>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">{post.contenido}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* B. CONCIERGE & TICKET SYSTEM */}
          {activeTab === 'mantenimiento' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Report ticket */}
              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#C5B39C]" />
                  Nueva Solicitud de Mantenimiento
                </h2>
                
                <form onSubmit={handleCreateTicket} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#C5B39C] tracking-widest">Área Común</label>
                    <select
                      value={newTicketArea}
                      onChange={(e) => setNewTicketArea(e.target.value)}
                      className="w-full h-12 px-4 bg-[#090D0A] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#C5B39C] transition-colors"
                    >
                      <option value="Gimnasio Wellness">Gimnasio Wellness</option>
                      <option value="Piscina del Resort">Piscina del Resort</option>
                      <option value="Canchas Deportivas">Canchas Deportivas</option>
                      <option value="Salón de Eventos VIP">Salón de Eventos VIP</option>
                      <option value="Sendero Ecológico">Sendero Ecológico</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#C5B39C] tracking-widest">Detalles del Incidente</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Escriba los detalles aquí..."
                      value={newTicketDesc}
                      onChange={(e) => setNewTicketDesc(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#C5B39C] transition-colors resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#C5B39C] tracking-widest block">Adjuntar Fotografía</label>
                    <div className="border border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:bg-white/5 transition-all relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setTicketFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Camera className="w-6 h-6 text-[#C5B39C] mx-auto mb-2" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {ticketFile ? ticketFile.name : 'Subir imagen para auditoría'}
                      </p>
                    </div>
                  </div>

                  {uploadingProgress >= 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-[#C5B39C]">
                        <span>Procesando archivo...</span>
                        <span>{uploadingProgress}%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadingProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploadingProgress >= 0}
                    className="w-full h-12 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#C5B39C] transition-colors"
                  >
                    Enviar Solicitud
                  </button>
                </form>
              </div>

              {/* Tickets list */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#C5B39C]">Historial de Solicitudes</h2>
                <div className="space-y-4">
                  {tickets.map((t) => (
                    <div key={t.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col sm:flex-row gap-6 items-center justify-between">
                      <div className="flex gap-4 items-center">
                        {t.fotoUrl ? (
                          <img src={t.fotoUrl} alt={t.areaComun} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-slate-500" />
                          </div>
                        )}
                        <div className="space-y-1 text-left">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            {t.fechaCreacion ? (t.fechaCreacion.toDate ? t.fechaCreacion.toDate().toLocaleDateString() : 'Hoy') : 'Hoy'}
                          </span>
                          <h4 className="text-lg font-bold text-white leading-tight">{t.areaComun}</h4>
                          <p className="text-xs text-slate-300 font-light leading-relaxed">{t.descripcion}</p>
                        </div>
                      </div>

                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        t.estado === 'Resuelto' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : t.estado === 'En proceso' 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {t.estado}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* C. FINANCIAL MANAGEMENT */}
          {activeTab === 'finanzas' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Summary panel */}
              <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl space-y-6 h-fit">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#C5B39C]" />
                  Estado Financiero
                </h2>

                <div className="p-6 bg-[#062113]/40 border border-[#C5B39C]/20 rounded-3xl relative overflow-hidden">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C5B39C]">Saldo Pendiente</span>
                  <div className="text-3xl font-black text-white mt-1">
                    ${expenses.reduce((sum, item) => item.estado === 'Pendiente' ? sum + item.monto : sum, 0).toFixed(2)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Lote</span>
                    <span className="text-white font-black">Lote 05</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Propietario</span>
                    <span className="text-white font-black">Familia Ortega</span>
                  </div>
                </div>
              </div>

              {/* Table of dues */}
              <div className="lg:col-span-8 space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#C5B39C]">Expensas e Historial</h2>
                
                {paymentSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Transacción completada con éxito.</span>
                  </div>
                )}

                <div className="space-y-4">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{exp.mes}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">• Vencimiento {exp.vencimiento}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{exp.tipo}</p>
                      </div>

                      <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Monto</span>
                          <span className="text-lg font-black text-white">${exp.monto.toFixed(2)}</span>
                        </div>

                        {exp.estado === 'Pagado' ? (
                          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            Pagado
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePayExpense(exp.id)}
                            disabled={payingId !== null}
                            className="px-6 py-2.5 bg-white text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-[#C5B39C] transition-colors flex items-center justify-center"
                          >
                            {payingId === exp.id ? (
                              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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

          {/* D. VISITS VIP ACCESS */}
          {activeTab === 'vip' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form */}
              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl h-fit">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#C5B39C]" />
                  Crear Código de Acceso VIP
                </h2>
                
                <form onSubmit={handleVipGenerate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#C5B39C] tracking-widest">Invitado de Honor</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre del visitante"
                      value={vipName}
                      onChange={(e) => setVipName(e.target.value)}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#C5B39C] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#C5B39C] tracking-widest">DNI / Documento</label>
                    <input
                      type="text"
                      required
                      placeholder="Cédula o pasaporte"
                      value={vipDni}
                      onChange={(e) => setVipDni(e.target.value)}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#C5B39C] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#C5B39C] transition-colors"
                  >
                    Generar Acceso VIP
                  </button>
                </form>
              </div>

              {/* QR display screen */}
              <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
                
                {generatedCode ? (
                  <div className="space-y-6 relative z-10 w-full max-w-sm">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#062113]/80 border border-[#C5B39C]/40 text-[#C5B39C] text-[10px] font-black uppercase tracking-wider mx-auto">
                      <Lock className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                      Pase VIP Activo
                    </div>

                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{vipName}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider -mt-4">Documento: {vipDni}</p>

                    <div className="relative p-6 bg-white rounded-3xl mx-auto w-52 h-52 flex items-center justify-center shadow-[0_0_50px_rgba(197,179,156,0.2)] border-4 border-[#C5B39C]">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedCode)}`} 
                        alt="VIP QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-center items-center gap-1.5 text-xs">
                        <Clock className="w-4 h-4 text-[#C5B39C] animate-spin" style={{ animationDuration: '4s' }} />
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Expira en: </span>
                        <span className="text-white font-black">
                          {Math.floor(qrTimeLeft / 60)}:{(qrTimeLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#C5B39C] uppercase font-bold tracking-widest">Código de Seguridad: {generatedCode}</p>
                    </div>

                  </div>
                ) : (
                  <div className="space-y-4 opacity-50 max-w-md mx-auto">
                    <QrCode className="w-16 h-16 text-slate-500 mx-auto animate-pulse" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Esperando datos</h3>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      El código QR de acceso VIP se actualizará automáticamente y brindará un pase de ingreso dinámico a la portería central.
                    </p>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
