'use client';

import { useUser } from '@/firebase';
import { generateDynamicQRToken } from '@/lib/qr-utils';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { ShieldAlert, Fingerprint, Loader2 } from 'lucide-react';

export default function QRPassPage() {
  const { user } = useUser();
  const [qrToken, setQrToken] = useState<string>('');
  const [countdown, setCountdown] = useState(60);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const status = localStorage.getItem('pampa_membership_payment_status') as 'paid' | 'pending';
      setPaymentStatus(status || 'pending');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || paymentStatus !== 'paid') return;

    const generateCode = () => {
      const token = generateDynamicQRToken(user.uid, user.email || '');
      setQrToken(token);
      setCountdown(60);
    };

    generateCode();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateCode();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, paymentStatus]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  if (paymentStatus !== 'paid') {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[70vh] space-y-6 px-6">
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-serif text-white tracking-wide">Acceso Denegado</h2>
        <p className="text-white/60 text-sm">
          No puedes generar códigos de acceso porque tu membresía registra un saldo pendiente. Por favor, regulariza tu pago en la sección de Suscripción.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-8 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif text-white tracking-wide">Pase Digital VIP</h2>
        <p className="text-[#777777] text-xs">Acerca este código a los torniquetes</p>
      </div>

      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#C5A059]/30 to-[#ebd7a1]/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50" />
        
        <div className="relative bg-white p-6 rounded-3xl shadow-2xl">
          {qrToken ? (
            <QRCodeSVG
              value={qrToken}
              size={240}
              level="H"
              fgColor="#05140b"
              bgColor="#ffffff"
            />
          ) : (
            <div className="w-[240px] h-[240px] flex items-center justify-center bg-gray-100 rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-2 border-2 border-[#C5A059]">
              <Fingerprint className="w-full h-full text-[#05140b]" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0A1A12] border border-[#C5A059]/20 rounded-2xl px-8 py-4 flex items-center gap-4">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="16" cy="16" r="14" stroke="#ffffff10" strokeWidth="2" fill="none" />
            <circle 
              cx="16" cy="16" r="14" 
              stroke="#C5A059" 
              strokeWidth="2" 
              fill="none"
              strokeDasharray={88}
              strokeDashoffset={88 - (88 * countdown) / 60}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-white">{countdown}</span>
        </div>
        <div>
          <span className="block text-[9px] font-bold uppercase tracking-widest text-[#777777]">Seguridad Rotativa</span>
          <span className="block text-xs font-medium text-white">Renovación en {countdown}s</span>
        </div>
      </div>
    </div>
  );
}
