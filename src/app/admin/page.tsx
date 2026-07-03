'use client';

import { useFirestore } from '@/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import {
  Activity,
  Users,
  CheckCircle2,
  Loader2,
  Mail,
  MoreHorizontal,
  UploadCloud,
  Lock,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { useAdminHeader } from './components/AdminHeaderContext';

// --- Dashboard Sub-Components ---
const PremiumGlassCard = ({ title, children, className = "", icon: Icon }: any) => (
  <div className={`border border-[#C5A059]/30 p-6 md:p-8 bg-[#FDFBF7] shadow-xs ${className}`}>
    <div className="flex justify-between items-start mb-6 border-b border-[#C5A059]/10 pb-4 relative z-10">
      <div className="flex items-center gap-3">
        {Icon && <div className="p-2 border border-[#C5A059]/20 rounded-none text-[#C5A059]"><Icon size={16} /></div>}
        <h3 className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <button className="text-[#777777] hover:text-[#333333] transition-colors active:scale-95">
        <MoreHorizontal size={18} />
      </button>
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

const StatMiniCard = ({ label, value, colorClass = "text-[#C5A059]" }: any) => (
  <div className="flex flex-col gap-1 p-5 border border-[#C5A059]/20 bg-[#FDFBF7] hover:border-[#C5A059] transition-all relative group">
    <span className="text-[9px] font-bold text-[#777777] uppercase tracking-widest relative z-10">{label}</span>
    <span className={`text-2xl font-light tracking-tight ${colorClass} relative z-10`}>{value}</span>
  </div>
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    leads: 0,
    reservations: 0,
    biometricScans: 0,
    users: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [biometricLogs, setBiometricLogs] = useState<any[]>([]);
  const db = useFirestore();

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const headerAction = useMemo(() => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2.5 px-4 py-1.5 border border-[#C5A059]/30 bg-[#FDFBF7] shadow-xs">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-ping"></div>
        <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest leading-none">Centro de Monitoreo</span>
      </div>
    </div>
  ), []);

  useAdminHeader('La Pampa Admin Hub', headerAction);

  useEffect(() => {
    if (!db) return;

    // 1. Usuarios
    const unsubUsers = onSnapshot(collection(db, 'usuarios'), snapshot => {
      setStats(prev => ({ ...prev, users: snapshot.size }));
    });

    // 2. Leads de Landing Page
    const qLeads = query(collection(db, 'contactos_landing'), orderBy('createdAt', 'desc'), limit(10));
    const unsubLeads = onSnapshot(qLeads, snapshot => {
      setStats(prev => ({ ...prev, leads: snapshot.size }));
      const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setRecentLeads(leads);
    });

    // 3. Registros Biométricos (Realtime logs)
    const qBiometric = query(collection(db, 'registros_biometricos'), orderBy('hora', 'desc'), limit(15));
    const unsubBiometric = onSnapshot(qBiometric, snapshot => {
      setStats(prev => ({ ...prev, biometricScans: snapshot.size }));
      const scanList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre || 'Desconocido',
          evento: data.evento || 'Ingreso',
          hora: data.hora ? (data.hora.toDate ? data.hora.toDate().toLocaleTimeString('es-ES') : '') : '',
          metodo: data.metodo || 'Facial',
          estadoAcceso: data.estadoAcceso || 'Aprobado',
          motivo: data.motivo || ''
        };
      });
      setBiometricLogs(scanList);
    });

    // 4. Reservas Wellness
    const unsubReservas = onSnapshot(collection(db, 'reservas_wellness'), snapshot => {
      setStats(prev => ({ ...prev, reservations: snapshot.size }));
    });

    return () => {
      unsubUsers();
      unsubLeads();
      unsubBiometric();
      unsubReservas();
    };
  }, [db]);

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setImportLoading(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const lines = csvText.split('\n');
      let count = 0;

      for (const line of lines) {
        if (!line.trim()) continue;
        const columns = line.split(',');
        if (columns.length < 3) continue;

        const name = columns[0].trim();
        const role = columns[1].trim(); 
        const username = columns[2].trim().toLowerCase(); 

        if (!name || !role || !username) continue;

        const docRef = doc(db, 'usuarios', username);
        await setDoc(docRef, {
          nombre: name,
          roles: [role.toLowerCase()],
          active: true,
          updatedAt: new Date()
        }, { merge: true });
        count++;
      }

      if (count > 0) {
        setImportSuccess(true);
        setCsvText('');
      } else {
        setImportError("Formato incorrecto. Use: Nombre, Rol, Email/Cédula");
      }
    } catch (err: any) {
      setImportError(err.message || "Error al procesar carga masiva.");
    } finally {
      setImportLoading(false);
    }
  };

  // Capacity calculations for luxury center
  const wellnessAforoMax = 20;
  const currentWellnessAforo = biometricLogs.filter(log => log.evento === 'Ingreso' && log.estadoAcceso === 'Aprobado').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-20 text-[#333333]">
      
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatMiniCard label="Nuevos Prospectos" value={stats.leads} colorClass="text-[#333333]" />
        <StatMiniCard label="Accesos Registrados" value={stats.biometricScans} colorClass="text-[#C5A059]" />
        <StatMiniCard label="Reservas Wellness" value={stats.reservations} colorClass="text-[#333333]" />
        <StatMiniCard label="Aforo Actual Wellness" value={`${currentWellnessAforo} / ${wellnessAforoMax}`} colorClass="text-[#C5A059]" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Logs de Accesos Biométricos (SINCRO DE ACCESOS Y ALERTAS) */}
        <PremiumGlassCard title="Monitoreo de Accesos Biométricos" className="lg:col-span-7" icon={Fingerprint}>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {biometricLogs.length === 0 ? (
              <p className="text-xs text-[#777777] text-center py-12">No se registran accesos recientes en portería.</p>
            ) : (
              biometricLogs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-4 border bg-[#FDFBF7] flex justify-between items-start gap-4 transition-all ${
                    log.estadoAcceso === 'Denegado' ? 'border-red-300 bg-red-50/20' : 'border-[#C5A059]/10 hover:border-[#C5A059]'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-[#333333] text-xs">{log.nombre}</p>
                    <p className="text-[9px] text-[#777777]">Método: {log.metodo} • {log.hora || 'Hace un momento'}</p>
                    {log.estadoAcceso === 'Denegado' && (
                      <p className="text-[9px] text-red-500 font-bold flex items-center gap-1 mt-1">
                        <ShieldAlert className="w-3 h-3 shrink-0" />
                        Motivo: {log.motivo || 'Mora Financiera'}
                      </p>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 border text-[8px] font-bold uppercase tracking-widest shrink-0 ${
                    log.estadoAcceso === 'Aprobado' 
                      ? 'border-emerald-500/20 text-emerald-600 bg-emerald-50/30' 
                      : 'border-red-500/20 text-red-500 bg-red-50/30'
                  }`}>
                    {log.estadoAcceso}
                  </span>
                </div>
              ))
            )}
          </div>
        </PremiumGlassCard>

        {/* Prospectos Recientes */}
        <PremiumGlassCard title="Prospectos del Club" className="lg:col-span-5" icon={Mail}>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {recentLeads.length === 0 ? (
              <p className="text-xs text-[#777777] text-center py-12">Sin prospectos de visitas guiadas.</p>
            ) : (
              recentLeads.map(lead => (
                <div key={lead.id} className="p-4 border border-[#C5A059]/10 bg-[#FDFBF7] flex justify-between items-start gap-4 hover:border-[#C5A059] transition-all">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#333333] text-xs">{lead.name}</p>
                    <p className="text-[9px] text-[#C5A059] font-medium">{lead.email} • {lead.phone}</p>
                    <p className="text-[10px] text-[#777777] font-light italic mt-1 line-clamp-2">"{lead.message}"</p>
                  </div>
                  <span className="px-2.5 py-0.5 border border-[#C5A059]/30 text-[#C5A059] text-[8px] font-bold uppercase tracking-wider shrink-0">
                    {lead.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </PremiumGlassCard>

      </div>

      {/* CSV Mass Importer & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <PremiumGlassCard title="Inyección Masiva de Perfiles (Super Admin)" className="lg:col-span-7" icon={Users}>
          <p className="text-xs text-[#777777] mb-4 font-light leading-relaxed">
            Permite la carga rápida y pre-creación de perfiles autorizados (seguridad, conserjería o propietarios) directamente en la base de datos de <b>La Pampa</b>.
          </p>
          <form onSubmit={handleImportCSV} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059] px-1">
                Formato CSV: Nombre, Rol, Email/Cédula
              </Label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={3}
                placeholder="Alejandro Valenzuela, Propietario, ale@correo.com&#10;Juan Diego Pérez, Mantenimiento, juan@correo.com"
                className="w-full p-4 bg-transparent border border-[#C5A059]/30 rounded-none text-[#333333] placeholder-[#777777]/50 text-xs focus:outline-none focus:border-[#C5A059] transition-colors resize-none font-mono"
                required
              />
            </div>

            {importSuccess && (
              <div className="flex items-center gap-2 border border-emerald-500/20 bg-emerald-50/50 p-3 text-xs text-emerald-700 animate-in fade-in duration-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <p>Carga masiva importada y guardada exitosamente.</p>
              </div>
            )}

            {importError && (
              <div className="flex items-center gap-2 border border-red-500/20 bg-red-50/50 p-3 text-xs text-red-700 animate-in fade-in duration-300">
                <p>{importError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={importLoading}
              className="w-full h-11 bg-[#333333] text-[#FDFBF7] border border-[#333333] font-bold uppercase tracking-widest text-[9px] rounded-none hover:bg-transparent hover:text-[#333333] transition-all flex items-center justify-center gap-2"
            >
              {importLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <UploadCloud className="w-4 h-4 text-[#C5A059]" />}
              <span>Importar Colaboradores</span>
            </button>
          </form>
        </PremiumGlassCard>

        {/* Global Security Metrics */}
        <PremiumGlassCard title="Capacidad e Integración" className="lg:col-span-5" icon={Activity}>
          <div className="space-y-6 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#777777] font-bold uppercase tracking-wider text-[9px]">Sincronización con IA</span>
              <span className="text-emerald-600 font-bold uppercase tracking-wider text-[9px]">En Línea</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#777777] font-bold uppercase tracking-wider text-[9px]">Estado de Pasarela Bancaria</span>
              <span className="text-[#333333] font-semibold text-[11px]">Sincronizada (0 fricción)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#777777] font-bold uppercase tracking-wider text-[9px]">Servidor de Video</span>
              <span className="text-[#333333] font-semibold text-[11px]">Simulado (WebRTC Ready)</span>
            </div>
            <div className="p-4 border border-[#C5A059]/20 bg-[#FDFBF7] space-y-2 mt-4">
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#C5A059] block">Nota de Operación</span>
              <p className="text-[10px] text-[#777777] font-light leading-relaxed">
                El aforo del spa se recalcula dinámicamente cada vez que se registra un ingreso o salida exitosa en los tótems biométricos de acceso.
              </p>
            </div>
          </div>
        </PremiumGlassCard>
      </div>

    </div>
  );
}
