'use client';

import { useAdminHeader } from '../components/AdminHeaderContext';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  Users, Fingerprint, Calendar, Clock, 
  Search, ShieldAlert, CheckCircle2, Filter 
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface BiometricRecord {
  id: string;
  nombre: string;
  evento: 'Ingreso' | 'Salida';
  hora: string;
  metodo: string;
  fechaDia: string;
}

const PremiumGlassCard = ({ title, children, className = "", icon: Icon }: any) => (
  <div className={`bg-[#0b2616]/40 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl ${className}`}>
    <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4 relative z-10">
      <div className="flex items-center gap-3">
        {Icon && <div className="p-2 bg-[#144229]/50 rounded-xl text-[#D4AF37] border border-[#D4AF37]/30"><Icon size={18} /></div>}
        <h3 className="text-xs font-black text-[#C5B39C] uppercase tracking-[0.2em]">{title}</h3>
      </div>
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

export default function BiometricAdminPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState<'Todos' | 'Ingreso' | 'Salida'>('Todos');
  const [filterDate, setFilterDate] = useState<'Hoy' | 'Todos'>('Hoy');
  const todayStr = new Date().toISOString().split('T')[0];

  const [records, setRecords] = useState<BiometricRecord[]>([
    { id: 'b-1', nombre: 'Carlos Mendoza (Seguridad)', evento: 'Ingreso', hora: '07:12:00', metodo: 'Reconocimiento Facial', fechaDia: new Date().toISOString().split('T')[0] },
    { id: 'b-2', nombre: 'Mariana Rivas (Jardinería)', evento: 'Ingreso', hora: '07:30:15', metodo: 'Reconocimiento Facial', fechaDia: new Date().toISOString().split('T')[0] },
    { id: 'b-3', nombre: 'Juan Diego Pérez (Mantenimiento)', evento: 'Ingreso', hora: '08:05:44', metodo: 'Reconocimiento Facial', fechaDia: new Date().toISOString().split('T')[0] },
    { id: 'b-4', nombre: 'Sofía Alarcón (Limpieza)', evento: 'Salida', hora: '17:00:20', metodo: 'Reconocimiento Facial', fechaDia: '2026-07-02' },
    { id: 'b-5', nombre: 'Ricardo Espinoza (Administración)', evento: 'Salida', hora: '18:15:30', metodo: 'Reconocimiento Facial', fechaDia: '2026-07-02' }
  ]);

  const headerAction = useMemo(() => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-2xl shadow-xl">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Servidor Biométrico Online</span>
      </div>
    </div>
  ), []);

  useAdminHeader('Registro Biométrico', headerAction);

  useEffect(() => {
    if (!db) return;

    // Realtime connection to firestore registro_biometrico
    const unsub = onSnapshot(collection(db, 'registro_biometrico'), (snapshot) => {
      const dbRecords: BiometricRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let formattedTime = 'Ahora';
        if (data.hora?.toDate) {
          formattedTime = data.hora.toDate().toLocaleTimeString();
        }
        dbRecords.push({
          id: doc.id,
          nombre: data.nombre || 'Desconocido',
          evento: data.evento || 'Ingreso',
          hora: formattedTime,
          metodo: data.metodo || 'Reconocimiento Facial',
          fechaDia: data.fechaDia || ''
        });
      });

      if (dbRecords.length > 0) {
        // Merge with existing mocks for visualization
        setRecords((prev) => {
          const merged = [...dbRecords];
          prev.forEach(p => {
            if (!merged.find(m => m.id === p.id)) {
              merged.push(p);
            }
          });
          return merged;
        });
      }
    });

    return () => unsub();
  }, [db]);

  // Filter logs
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent === 'Todos' || r.evento === filterEvent;
    const matchesDate = filterDate === 'Todos' || r.fechaDia === todayStr;
    return matchesSearch && matchesEvent && matchesDate;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-20">
      
      {/* Search and filter row */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0b2616]/40 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5B39C]" />
          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-[#05140b] border border-white/10 rounded-2xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Date Filter */}
          <div className="flex bg-[#05140b] p-1 border border-white/10 rounded-2xl">
            {(['Hoy', 'Todos'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setFilterDate(d)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterDate === d ? 'bg-[#144229] text-[#D4AF37] border border-[#D4AF37]/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                {d === 'Hoy' ? 'Hoy' : 'Todos los días'}
              </button>
            ))}
          </div>

          <div className="flex bg-[#05140b] p-1 border border-white/10 rounded-2xl">
            {(['Todos', 'Ingreso', 'Salida'] as const).map((e) => (
              <button
                key={e}
                onClick={() => setFilterEvent(e)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterEvent === e ? 'bg-[#144229] text-[#D4AF37] border border-[#D4AF37]/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="grid grid-cols-1 gap-8">
        <PremiumGlassCard title="Registros de Accesos del Personal" icon={Users}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[#C5B39C] uppercase text-[9px] tracking-widest font-black">
                  <th className="py-4 px-6">Colaborador</th>
                  <th className="py-4 px-6">Fecha</th>
                  <th className="py-4 px-6">Hora</th>
                  <th className="py-4 px-6">Método</th>
                  <th className="py-4 px-6 text-right">Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6 font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                        {r.nombre}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{r.fechaDia}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[#D4AF37]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{r.hora}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        <div className="inline-flex items-center gap-1.5 bg-[#05140b] px-3 py-1 rounded-lg border border-white/5">
                          <Fingerprint className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{r.metodo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                          r.evento === 'Ingreso' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {r.evento}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest">
                      No se encontraron registros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PremiumGlassCard>
      </div>

    </div>
  );
}
