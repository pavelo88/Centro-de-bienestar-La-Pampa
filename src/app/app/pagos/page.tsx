'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const status = localStorage.getItem('pampa_membership_payment_status') as 'paid' | 'pending';
      setPaymentStatus(status || 'pending');
    }
  }, []);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      localStorage.setItem('pampa_membership_payment_status', 'paid');
      setPaymentStatus('paid');
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col mb-8">
        <h2 className="text-xl font-serif text-white tracking-wide">Suscripción y Pagos</h2>
        <p className="text-[#777777] text-xs mt-1">Gestiona tu Membresía Black</p>
      </div>

      {paymentStatus === 'paid' && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-bold uppercase tracking-widest text-xs">Pago al Día</h3>
          <p className="text-[10px] text-white/70 px-4">Tu próximo ciclo de facturación es el 5 de Agosto de 2026.</p>
        </div>
      )}

      {paymentStatus === 'pending' && (
        <div className="p-6 rounded-xl border border-[#C5A059]/30 bg-gradient-to-br from-[#0A1A12] to-black relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle className="w-24 h-24 text-[#C5A059]" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-red-400">Saldo Pendiente</span>
          <div className="text-4xl font-light text-white mt-2 font-serif">$150.00</div>
          <p className="text-xs text-white/50 mt-1">Correspondiente a Julio 2026</p>

          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full mt-6 h-12 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pagar con Tarjeta Guardada
              </>
            )}
          </button>
        </div>
      )}

      <div className="bg-[#0A1A12] border border-white/5 rounded-xl p-4">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-4 flex items-center gap-2">
          <History className="w-3 h-3" />
          Historial Reciente
        </h4>
        <div className="space-y-4 text-xs">
          {paymentStatus === 'paid' && (
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <span className="block text-white font-medium">Membresía Black - Julio</span>
                <span className="block text-[#777777] text-[10px] mt-0.5">Hace unos momentos</span>
              </div>
              <span className="text-emerald-400 font-bold">+$150.00</span>
            </div>
          )}
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <span className="block text-white font-medium">Membresía Black - Junio</span>
              <span className="block text-[#777777] text-[10px] mt-0.5">05 Jun 2026</span>
            </div>
            <span className="text-white/50 font-bold">+$150.00</span>
          </div>
          <div className="flex justify-between items-center pb-1">
            <div>
              <span className="block text-white font-medium">Membresía Black - Mayo</span>
              <span className="block text-[#777777] text-[10px] mt-0.5">05 May 2026</span>
            </div>
            <span className="text-white/50 font-bold">+$150.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
