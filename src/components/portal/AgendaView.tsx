'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Calendar, Clock, User, Car, CheckCircle, XCircle } from 'lucide-react';

interface Visita {
  id: string;
  invitado: string;
  documento: string;
  residente: string;
  estado: 'Esperando' | 'Ingresó' | 'Rechazado';
  fechaLlegada?: string;
  vehiculo?: string;
}

const mockVisitas: Visita[] = [
  { id: '1', invitado: 'Juan Pérez', documento: '1720493829', residente: 'Lote 05', estado: 'Esperando', vehiculo: 'PCH-1234' },
  { id: '2', invitado: 'María Gómez', documento: '0918273645', residente: 'Lote 14', estado: 'Ingresó', fechaLlegada: '10:30 AM' },
  { id: '3', invitado: 'Carlos Ruiz (Delivery)', documento: 'N/A', residente: 'Lote 22', estado: 'Rechazado' },
];

export default function AgendaView({ userRole }: { userRole: string }) {
  const firebase = useFirebase();
  const db = firebase?.firestore;
  const [visitas, setVisitas] = useState<Visita[]>(mockVisitas);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'agenda_visitas'), orderBy('fechaCreacion', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: Visita[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          invitado: data.invitado || '',
          documento: data.documento || '',
          residente: data.residente || '',
          estado: data.estado || 'Esperando',
          fechaLlegada: data.fechaLlegada || '',
          vehiculo: data.vehiculo || ''
        });
      });
      if (list.length > 0) {
        setVisitas(list);
      }
    }, (err) => console.warn("No se pudo leer agenda de visitas, usando mock", err));
    return () => unsub();
  }, [db]);

  const handleUpdateStatus = (id: string, newStatus: Visita['estado']) => {
    if (userRole !== 'Guardia' && userRole !== 'Administrador') return;
    setVisitas(visitas.map(v => v.id === id ? { ...v, estado: newStatus, fechaLlegada: newStatus === 'Ingresó' ? new Date().toLocaleTimeString() : v.fechaLlegada } : v));
    // Aquí iría la lógica para actualizar Firestore
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#C5B39C]" />
          Agenda del Día
        </h2>
        <span className="px-3 py-1 bg-[#144229] text-[#E5DED4] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#D4AF37]/50">
          Hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      <div className="space-y-4">
        {visitas.map((v) => (
          <div key={v.id} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className={\`w-12 h-12 rounded-full flex items-center justify-center \${v.estado === 'Ingresó' ? 'bg-emerald-500/20 text-emerald-400' : v.estado === 'Rechazado' ? 'bg-rose-500/20 text-rose-400' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}\`}>
                {v.estado === 'Ingresó' ? <CheckCircle className="w-6 h-6" /> : v.estado === 'Rechazado' ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
              </div>
              <div>
                <h4 className="text-white font-bold">{v.invitado}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {v.residente}</span>
                  {v.vehiculo && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {v.vehiculo}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right mr-4">
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Estado</span>
                <span className={\`text-xs font-bold uppercase \${v.estado === 'Ingresó' ? 'text-emerald-400' : v.estado === 'Rechazado' ? 'text-rose-400' : 'text-[#D4AF37]'}\`}>
                  {v.estado} {v.fechaLlegada && \`(\${v.fechaLlegada})\`}
                </span>
              </div>
              
              {(userRole === 'Guardia' || userRole === 'Administrador') && v.estado === 'Esperando' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(v.id, 'Ingresó')}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors"
                    title="Autorizar Ingreso"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(v.id, 'Rechazado')}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors"
                    title="Rechazar"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {visitas.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No hay visitas programadas para hoy.</p>
          </div>
        )}
      </div>
    </div>
  );
}
