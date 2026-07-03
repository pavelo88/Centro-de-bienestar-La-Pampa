'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { 
  Fingerprint, Camera, ShieldAlert, CheckCircle2, 
  Calendar, Clock, ChevronDown, Lock, ShieldX, ScanFace
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

interface BiometricLog {
  id: string;
  nombre: string;
  evento: 'Ingreso' | 'Salida';
  hora: string;
  metodo: string;
  fechaDia: string;
  estadoAcceso: 'Aprobado' | 'Denegado';
  motivo?: string;
}

const mockStaff = [
  'Cliente VIP - Membresía Black',
  'Carlos Mendoza (Seguridad)',
  'Mariana Rivas (Wellness Spa)',
  'Juan Diego Pérez (Mantenimiento)'
];

export default function BiometricPortal() {
  const db = useFirestore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [staffName, setStaffName] = useState(mockStaff[0]);
  const [eventType, setEventType] = useState<'Ingreso' | 'Salida'>('Ingreso');
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'denied'>('idle');
  const [showHistory, setShowHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Biometric Logs State
  const [logs, setLogs] = useState<BiometricLog[]>([
    { id: 'b-1', nombre: 'Carlos Mendoza (Seguridad)', evento: 'Ingreso', hora: '07:12:00', metodo: 'Reconocimiento Facial', fechaDia: new Date().toISOString().split('T')[0], estadoAcceso: 'Aprobado' },
    { id: 'b-2', nombre: 'Mariana Rivas (Jardinería)', evento: 'Ingreso', hora: '07:30:15', metodo: 'Reconocimiento Facial', fechaDia: new Date().toISOString().split('T')[0], estadoAcceso: 'Aprobado' }
  ]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('UNSUPPORTED');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Cámara no activa o sin permisos, usando simulación.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleScan = () => {
    if (scanStatus === 'scanning') return;
    setScanStatus('scanning');
    setErrorMessage(null);

    setTimeout(async () => {
      const timeNow = new Date().toLocaleTimeString('es-ES');
      let accessResult: 'Aprobado' | 'Denegado' = 'Aprobado';
      let denyReason = '';

      if (staffName.includes('Cliente')) {
        const paymentStatus = localStorage.getItem('pampa_membership_payment_status');
        if (paymentStatus !== 'paid') {
          accessResult = 'Denegado';
          denyReason = 'Membresía Pendiente de Pago';
          setErrorMessage('Acceso Denegado: Su cuenta registra saldo pendiente en el portal de cliente.');
        }
      }

      const newLog: BiometricLog = {
        id: `b-${Date.now()}`,
        nombre: staffName,
        evento: eventType,
        hora: timeNow,
        metodo: 'Reconocimiento Facial',
        fechaDia: todayStr,
        estadoAcceso: accessResult,
        motivo: denyReason
      };

      if (db) {
        try {
          await addDoc(collection(db, 'registros_biometricos'), {
            nombre: staffName,
            evento: eventType,
            hora: serverTimestamp(),
            metodo: 'Reconocimiento Facial',
            fechaDia: todayStr,
            estadoAcceso: accessResult,
            motivo: denyReason
          });
        } catch (e) {
          console.warn("Firestore error adding scan log:", e);
        }
      }

      setLogs([newLog, ...logs]);
      setScanStatus(accessResult === 'Aprobado' ? 'success' : 'denied');

      setTimeout(() => {
        setScanStatus('idle');
      }, 4000);
    }, 2500); // 2.5s escaneo futurista
  };

  const todayLogs = logs.filter(l => l.fechaDia === todayStr);
  const historyLogs = logs.filter(l => l.fechaDia !== todayStr);

  return (
    <div className="relative bg-transparent text-foreground min-h-screen overflow-x-hidden pt-28 pb-16 selection:bg-cyan-500/20 selection:text-foreground transition-colors duration-700">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mt-8 mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-panel border-cyan-500/30">
            <Fingerprint className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-cyan-400">Terminal de Control Biométrico</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif text-foreground uppercase italic drop-shadow-md">
            Escáner de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pampa-oro">Acceso</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground/70 font-light max-w-xl mx-auto leading-relaxed">
            Verificación facial integrada en tiempo real. La terminal consulta automáticamente la solvencia de membresía para autorizar el ingreso al Santuario Wellness.
          </p>
        </div>

        {/* Main interactive biometric row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Panel: Camera scanner */}
          <div className="lg:col-span-7 glass-panel border border-white/10 p-6 sm:p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-2xl">
            
            {/* The Camera Feed Box */}
            <div className="relative aspect-video w-full rounded-2xl bg-black/50 overflow-hidden flex items-center justify-center border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
              
              {cameraActive ? (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100 opacity-70 mix-blend-screen"
                  />
                  
                  {/* Digital overlay frame */}
                  <div className="absolute inset-0 border-2 border-cyan-500/20 m-6 rounded-xl pointer-events-none" />
                  
                  {/* Face box tracker simulator */}
                  <div className="absolute w-48 h-48 border border-dashed border-cyan-400 rounded-full flex items-center justify-center animate-[spin-slow_10s_linear_infinite] pointer-events-none"></div>
                  
                  <div className="absolute w-4 h-4 border-t-2 border-l-2 border-cyan-400 top-[20%] left-[25%] pointer-events-none" />
                  <div className="absolute w-4 h-4 border-t-2 border-r-2 border-cyan-400 top-[20%] right-[25%] pointer-events-none" />
                  <div className="absolute w-4 h-4 border-b-2 border-l-2 border-cyan-400 bottom-[20%] left-[25%] pointer-events-none" />
                  <div className="absolute w-4 h-4 border-b-2 border-r-2 border-cyan-400 bottom-[20%] right-[25%] pointer-events-none" />
                </>
              ) : (
                <div className="text-center p-8 space-y-6 relative z-10">
                  <div className="w-24 h-24 rounded-full border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-400 bg-cyan-400/5 relative">
                    <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-20"></div>
                    <ScanFace className="w-12 h-12 stroke-[1]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-foreground uppercase tracking-widest font-bold">Simulación de Escáner</p>
                    <p className="text-[9px] text-cyan-400 mt-2 font-light uppercase tracking-widest">Listo para mapeo tridimensional</p>
                  </div>
                </div>
              )}

              {/* Scanning animation (Laser) */}
              {scanStatus === 'scanning' && (
                <>
                  <div className="absolute left-0 w-full h-[1px] bg-cyan-400 shadow-[0_0_15px_#22d3ee,0_0_30px_#22d3ee] z-20 animate-[scan_2s_ease-in-out_infinite]" />
                  <div className="absolute inset-0 bg-cyan-500/10 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                    <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 animate-pulse drop-shadow-md">Analizando Biometría...</span>
                  </div>
                </>
              )}

              {/* Status overlays */}
              <AnimatePresence>
                {scanStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-green-500/20 backdrop-blur-md border-2 border-green-500 flex flex-col items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-400 stroke-[1] drop-shadow-md" />
                    <span className="text-lg font-bold uppercase tracking-[0.15em] text-white drop-shadow-md">Acceso Autorizado</span>
                    <span className="text-[10px] text-green-300 uppercase tracking-widest">{eventType} validado correctamente</span>
                  </motion.div>
                )}

                {scanStatus === 'denied' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-500/20 backdrop-blur-md border-2 border-red-500 flex flex-col items-center justify-center gap-3"
                  >
                    <ShieldX className="w-16 h-16 text-red-500 stroke-[1] drop-shadow-md" />
                    <span className="text-lg font-bold uppercase tracking-[0.15em] text-white drop-shadow-md">Ingreso Rechazado</span>
                    <span className="text-[10px] text-red-300 uppercase tracking-widest font-bold">Mora Financiera Detectada</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs flex items-center gap-3 animate-in fade-in">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Selector panel */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
              <div className="sm:col-span-5 space-y-2">
                <label className="text-[9px] font-bold uppercase text-pampa-oro tracking-widest">Sujeto a Validar</label>
                <select
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full h-12 px-4 bg-background/50 border border-white/10 rounded-xl text-foreground text-xs focus:outline-none focus:border-pampa-oro transition-colors backdrop-blur-md"
                >
                  {mockStaff.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4 space-y-2">
                <label className="text-[9px] font-bold uppercase text-pampa-oro tracking-widest">Tipo de Registro</label>
                <div className="grid grid-cols-2 gap-2 bg-background/50 p-1 border border-white/10 rounded-xl backdrop-blur-md">
                  {(['Ingreso', 'Salida'] as const).map((type) => {
                    const isSel = eventType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEventType(type)}
                        className={`h-9 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                          isSel ? 'bg-pampa-oro text-white shadow-md' : 'text-foreground/50 hover:text-foreground'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={scanStatus !== 'idle'}
                  className="w-full h-12 bg-cyan-600 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:shadow-none"
                >
                  <ScanFace className="w-4 h-4" />
                  Escanear
                </button>
              </div>
            </div>

          </div>

          {/* Right Panel: Today's Registry Logs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="glass-panel border border-white/10 p-6 sm:p-8 rounded-3xl flex-1 shadow-2xl">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-pampa-oro mb-6 flex justify-between items-center">
                <span>Sesiones del Día</span>
                <span className="px-3 py-1 bg-pampa-oro/10 rounded-full text-pampa-oro text-[10px] font-bold tracking-normal border border-pampa-oro/30">
                  {todayLogs.length} Registros
                </span>
              </h2>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {todayLogs.length > 0 ? (
                  todayLogs.map((log) => (
                    <div key={log.id} className="glass-panel border border-white/5 p-4 rounded-xl flex justify-between items-center hover:border-cyan-500/50 transition-all">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-foreground leading-none">{log.nombre.split(' (')[0]}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          log.estadoAcceso === 'Aprobado' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {log.estadoAcceso} {log.motivo && ` - ${log.motivo}`}
                        </span>
                      </div>
                      <div className="text-right space-y-1.5">
                        <span className="text-[10px] font-mono text-cyan-400 leading-none bg-cyan-400/10 px-2 py-0.5 rounded">{log.hora}</span>
                        <span className="block text-[8px] font-bold uppercase tracking-widest text-foreground/50">{log.evento}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-foreground/40 text-xs">Sin registros de accesos hoy.</div>
                )}
              </div>
            </div>

            <div className="glass-panel border border-white/10 p-4 rounded-2xl">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-pampa-oro transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pampa-oro" />
                  <span>Historial de Accesos Antiguos</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-white/10 space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar overflow-hidden"
                  >
                    {historyLogs.length > 0 ? (
                      historyLogs.map((log) => (
                        <div key={log.id} className="flex justify-between items-center text-xs text-foreground/70 py-2 border-b border-white/5 last:border-b-0">
                          <div className="truncate pr-4 max-w-[180px]">
                            <span className="font-semibold text-foreground/90">{log.nombre.split(' (')[0]}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[9px] text-pampa-oro">{log.fechaDia} • {log.hora}</span>
                            <span className={`font-bold uppercase text-[8px] ml-2 ${
                              log.estadoAcceso === 'Aprobado' ? 'text-green-400' : 'text-red-400'
                            }`}>{log.estadoAcceso}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-foreground/40 text-[10px]">Historial vacío.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
