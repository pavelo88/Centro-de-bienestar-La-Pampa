'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, query, doc, deleteDoc } from 'firebase/firestore';
import { Users, Mail, Trash2, Shield, Calendar } from 'lucide-react';
import WebRequests from '@/app/admin/components/web-requests';

function UsersManager() {
  const db = useFirestore();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'pre_registros'));
    return onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setUsers(list);
    });
  }, [db]);

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'pre_registros', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-[#E5DED4]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#144229]/50 rounded-2xl text-[#D4AF37] border border-[#D4AF37]/30">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-serif text-white">Pre-Registros & Personal</h2>
          <p className="text-xs text-[#C5B39C]/70 font-light">Usuarios importados pendientes de primer ingreso.</p>
        </div>
      </div>

      <div className="bg-[#0b2616]/40 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[#C5B39C] uppercase text-[9px] tracking-widest font-black">
                <th className="py-4 px-6">Nombre</th>
                <th className="py-4 px-6">Rol</th>
                <th className="py-4 px-6">Cédula / DNI</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-6 font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                    {u.nombre}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 bg-[#05140b] px-3 py-1 rounded-lg border border-white/5 text-[#C5B39C]">
                      <Shield size={12} className="text-[#D4AF37]" />
                      <span>{u.rol}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-[#C5B39C]">
                    {u.cedula}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      u.primerIngreso 
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    }`}>
                      {u.primerIngreso ? 'Pendiente Clave' : 'Activo'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleDelete(u.id)}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Eliminar pre-registro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest">
                    No hay usuarios pre-registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDynamicPage() {
  const params = useParams();
  const slug = params.slug as string;

  if (slug === 'users') {
    return <UsersManager />;
  }

  if (slug === 'web-requests') {
    return <WebRequests />;
  }

  return (
    <div className="flex items-center justify-center h-96 text-[#E5DED4]">
      <p className="text-slate-500 font-medium italic">Página no encontrada o en construcción.</p>
    </div>
  );
}