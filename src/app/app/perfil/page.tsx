'use client';

import { useUser } from '@/firebase';
import { Camera, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ClientProfilePage() {
  const { user } = useUser();
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const status = localStorage.getItem('pampa_membership_payment_status') as 'paid' | 'pending';
      setPaymentStatus(status || 'pending');
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Profile Section */}
      <div className="flex flex-col items-center justify-center pt-4 pb-6 border-b border-[#C5A059]/20">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full border-2 border-[#C5A059] bg-[#0A1A12] flex items-center justify-center overflow-hidden relative">
            <span className="text-4xl">🧘‍♀️</span>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-[#C5A059] rounded-full text-[#05140b] shadow-lg">
            <Edit2 size={14} />
          </button>
        </div>
        
        <h2 className="mt-4 text-2xl font-serif text-white tracking-wide">
          {user ? user.displayName || 'Cliente VIP' : 'Cliente VIP'}
        </h2>
        <p className="text-[#777777] text-xs font-bold uppercase tracking-widest mt-1">
          {user ? user.email : 'cargando...'}
        </p>

        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-[9px] font-black uppercase tracking-widest">
          Membresía Black Activa
        </div>
      </div>

      {/* Status Card */}
      <div className={`p-4 rounded-xl border relative overflow-hidden ${
        paymentStatus === 'paid' 
          ? 'bg-emerald-950/30 border-emerald-500/30' 
          : 'bg-red-950/30 border-red-500/30'
      }`}>
        <div className="flex items-start gap-4 relative z-10">
          <div className={`p-2 rounded-full ${paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {paymentStatus === 'paid' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${paymentStatus === 'paid' ? 'text-emerald-400' : 'text-red-400'}`}>
              Estado de Acceso
            </h3>
            <p className="text-xs text-white/70 mt-1">
              {paymentStatus === 'paid' 
                ? 'Tu membresía está al día. Tienes acceso sin restricciones a las disciplinas wellness.' 
                : 'Membresía pendiente de pago. Tu acceso mediante QR y biometría se encuentra suspendido.'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="space-y-4">
        <div className="bg-[#0A1A12] border border-white/5 rounded-xl p-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-3">Información Médica</h4>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-[#777777]">Tipo de Sangre</span>
              <span className="text-white font-medium">O Positivo</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-[#777777]">Alergias</span>
              <span className="text-white font-medium">Ninguna</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777777]">Condiciones Previas</span>
              <span className="text-white font-medium">Lesión Leve Rodilla (2025)</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0A1A12] border border-white/5 rounded-xl p-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-3">Estadísticas Mensuales</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-black/40 rounded-lg">
              <span className="block text-2xl font-serif text-white">12</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#777777]">Sesiones</span>
            </div>
            <div className="text-center p-3 bg-black/40 rounded-lg">
              <span className="block text-2xl font-serif text-white">2.5<span className="text-sm">h</span></span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#777777]">Prom. Semanal</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
