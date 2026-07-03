'use client';

import { useFirestore } from '@/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import {
  Activity,
  Users,
  CheckCircle2,
  Loader2,
  ScanFace,
  Calendar,
  Mail,
  MoreHorizontal,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import { useAdminHeader } from './components/AdminHeaderContext';

// --- Dashboard Sub-Components ---
const PremiumGlassCard = ({ title, children, className = "", icon: Icon }: any) => (
    <div className={`bg-[#0b2616]/40 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl ${className}`}>
        <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4 relative z-10">
            <div className="flex items-center gap-3">
                {Icon && <div className="p-2 bg-[#144229]/50 rounded-xl text-[#D4AF37] border border-[#D4AF37]/30"><Icon size={18} /></div>}
                <h3 className="text-xs font-black text-[#C5B39C] uppercase tracking-[0.2em]">{title}</h3>
            </div>
            <button className="text-[#C5B39C] hover:text-white transition-colors transition-transform active:scale-95">
                <MoreHorizontal size={20} />
            </button>
        </div>
        <div className="relative z-10">{children}</div>
    </div>
);

const StatMiniCard = ({ label, value, colorClass = "text-[#D4AF37]" }: any) => (
    <div className="flex flex-col gap-1 p-4 bg-[#05140b] border border-white/10 rounded-3xl hover:bg-white/5 transition-colors relative group">
        <span className="text-[10px] font-black text-[#C5B39C] uppercase tracking-widest relative z-10">{label}</span>
        <span className={`text-2xl font-black tracking-tight ${colorClass} relative z-10`}>{value}</span>
    </div>
);

// --- Main Dashboard Page ---
export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        leads: 0,
        reservations: 0,
        biometricScans: 0,
        users: 0,
    });
    const [recentLeads, setRecentLeads] = useState<any[]>([]);
    const db = useFirestore();

    // CSV Import State
    const [csvText, setCsvText] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);

    const headerAction = useMemo(() => (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-6 py-2 bg-[#0b2616]/40 border border-white/10 rounded-2xl shadow-xl">
                <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></div>
                <span className="text-[10px] font-black text-[#C5B39C] uppercase tracking-widest leading-none">Centro de Comando</span>
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
            setStats(prev => ({ ...prev, leads: snapshot.size })); // Not totally accurate for all time, just current query size for demo
            
            const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            setRecentLeads(leads);
        });

        // 3. Registros Biométricos
        const unsubBiometric = onSnapshot(collection(db, 'registros_biometricos'), snapshot => {
            setStats(prev => ({ ...prev, biometricScans: snapshot.size }));
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
                const role = columns[1].trim(); // propietario, trabajador, admin, seguridad
                const username = columns[2].trim().toLowerCase(); 

                if (!name || !role || !username) continue;

                // Forzar la pre-creación o actualización de un usuario
                const docRef = doc(db, 'usuarios', username); // asumiendo que el username es el email temporalmente o ID
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-20 text-[#E5DED4]">
            
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatMiniCard label="Nuevos Leads" value={stats.leads} colorClass="text-[#FAF9F6]" />
                <StatMiniCard label="Escaneos Garita" value={stats.biometricScans} colorClass="text-[#D4AF37]" />
                <StatMiniCard label="Reservas Spa" value={stats.reservations} colorClass="text-[#FAF9F6]" />
                <StatMiniCard label="Residentes/Staff" value={stats.users} colorClass="text-[#D4AF37]" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Leads Recientes */}
                <PremiumGlassCard title="Prospectos (Landing Page)" className="lg:col-span-7" icon={Mail}>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentLeads.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">No hay prospectos recientes.</p>
                        ) : (
                            recentLeads.map(lead => (
                                <div key={lead.id} className="p-4 bg-[#05140b] border border-white/5 rounded-2xl flex justify-between items-start gap-4 hover:border-white/20 transition-colors">
                                    <div>
                                        <p className="font-bold text-white text-sm">{lead.name}</p>
                                        <p className="text-xs text-[#C5B39C] mt-1">{lead.email} • {lead.phone}</p>
                                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{lead.message}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-[#144229]/50 text-[#D4AF37] border border-[#D4AF37]/30 text-[9px] font-black uppercase tracking-widest rounded-full shrink-0">
                                        {lead.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </PremiumGlassCard>

                {/* CSV Mass Importer (Super Admin Tool) */}
                <PremiumGlassCard title="Herramienta Super Admin" className="lg:col-span-5" icon={Users}>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        Cargue perfiles masivos a la base de datos de <b>La Pampa</b>. Esto saltará validaciones de registro para dar acceso inmediato a propietarios o seguridad.
                    </p>
                    <form onSubmit={handleImportCSV} className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#C5B39C] px-1">
                                Formato: Nombre, Rol, Email/ID
                            </Label>
                            <textarea
                                value={csvText}
                                onChange={(e) => setCsvText(e.target.value)}
                                rows={3}
                                placeholder="Alejandro, propietario, ale@correo.com&#10;Maria, seguridad, maria@correo.com"
                                className="w-full p-4 bg-[#05140b] border border-white/10 rounded-2xl text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#D4AF37] transition-colors resize-none font-mono"
                                required
                            />
                        </div>

                        {importSuccess && (
                            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200 animate-in fade-in duration-300">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                                <p>Usuarios inyectados correctamente.</p>
                            </div>
                        )}

                        {importError && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200 animate-in fade-in duration-300">
                                <p>{importError}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={importLoading}
                            className="w-full h-12 bg-[#144229] hover:bg-[#0b2616] border border-[#D4AF37]/50 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {importLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <UploadCloud className="w-4 h-4 text-[#D4AF37]" />}
                            <span>Forzar Creación de Usuarios</span>
                        </button>
                    </form>
                </PremiumGlassCard>

            </div>

            {/* Visualizer Chart */}
            <div className="grid grid-cols-1 gap-8">
                <PremiumGlassCard title="Actividad Global de la Urbanización" icon={Activity}>
                    <div className="h-[280px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { name: 'Día 1', leads: 4, scans: 24, spa: 2 },
                                { name: 'Día 2', leads: 7, scans: 45, spa: 5 },
                                { name: 'Hoy (Estimado)', leads: stats.leads, scans: stats.biometricScans, spa: stats.reservations }
                            ]}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#05140b', border: '1px solid #ffffff10', borderRadius: '12px', color: '#FAF9F6' }} />
                                <Area type="monotone" dataKey="scans" stroke="#ffffff" strokeWidth={2} fillOpacity={0.1} fill="url(#colorLeads)" />
                                <Area type="monotone" dataKey="leads" stroke="#D4AF37" strokeWidth={3} fillOpacity={0.8} fill="url(#colorLeads)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </PremiumGlassCard>
            </div>
        </div>
    );
}
