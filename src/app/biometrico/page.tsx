'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { 
  Fingerprint, Camera, ShieldAlert, CheckCircle2, 
  ArrowLeftRight, Calendar, User, Clock, ChevronDown 
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface BiometricLog {
  id: string;
  nombre: string;
  evento: 'Ingreso' | 'Salida';
  hora: string;
  metodo: string;
  fechaDia: string;
}

const mockStaff = [
  'Carlos Mendoza (Seguridad)',
  'Mariana Rivas (Jardinería)',
  'Juan Diego Pérez (Mantenimiento)',
  'Sofía Alarcón (Limpieza)',
  'Ricardo Espinoza (Administración)'
];

export default function BiometricPortal() {
  const db = useFirestore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [staffName, setStaffName] = useState(mockStaff[0]);
  const [eventType, setEventType] = useState<'Ingreso' | 'Salida'>('Ingreso');
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [showHistory, setShowHistory] = useState(false);
  
  // Biometric Logs State
  const [logs, setLogs] = useState<BiometricLog[]>([
    { id: 'b-1', nombre: 'Carlos Mendoza (Seguridad)', evento: 'Ingreso', hora: '07:12:00', metodo: 'Reconocimiento Facial', fechaDia: new Date().toISOString().split('T')[0] },
    { id: 'b-2', nombre: 'Mariana Rivas (Jardinería)', evento: 'Ingreso', hora: '07:30:15', metodo: 'Reconocimiento Facial', fechaDia: new Date().toISOString().split('T')[0] },
    { id: 'b-3', nombre: 'Juan Diego Pérez (Mantenimiento)', evento: 'Ingreso', hora: '08:05:44', metodo: 'Reconocimiento Facial', fechaDia: new Date().toISOString().split('T')[0] },
    { id: 'b-4', nombre: 'Sofía Alarcón (Limpieza)', evento: 'Salida', hora: '17:00:20', metodo: 'Reconocimiento Facial', fechaDia: '2026-07-02' },
    { id: 'b-5', nombre: 'Ricardo Espinoza (Administración)', evento: 'Salida', hora: '18:15:30', metodo: 'Reconocimiento Facial', fechaDia: '2026-07-02' }
  ]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Today Date Helper
  const todayStr = new Date().toISOString().split('T')[0];

  // Camera start handler with robust error handling
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
      let message = 'Error desconocido al acceder a la cámara.';
      if (err?.message === 'UNSUPPORTED') {
        message = 'Este navegador no soporta acceso a la cámara. Usa Chrome o Edge con HTTPS.';
      } else if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        message = 'Permiso de cámara denegado. Habilita el acceso en la configuración de tu navegador.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        message = 'No se detectó ninguna cámara en este dispositivo.';
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        message = 'La cámara está siendo utilizada por otra aplicación. Ciérrala e intenta de nuevo.';
      } else if (err?.name === 'OverconstrainedError') {
        message = 'La resolución solicitada no es compatible con tu cámara.';
      } else if (err?.name === 'TypeError') {
        message = 'Error de protocolo. Asegúrate de estar usando HTTPS.';
      }
      console.warn('Error de cámara biométrica:', err);
      setCameraError(message);
      // Fallback: still allow scan workflow for demo purposes
      setCameraActive(true);
    }
  };

  // Camera stop handler
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
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Biometric scan verification
  const handleScan = () => {
    if (scanStatus === 'scanning') return;
    setScanStatus('scanning');

    setTimeout(async () => {
      const timeNow = new Date().toLocaleTimeString();
      const newLog: BiometricLog = {
        id: `b-${Date.now()}`,
        nombre: staffName,
        evento: eventType,
        hora: timeNow,
        metodo: 'Reconocimiento Facial',
        fechaDia: todayStr
      };

      // Add to firestore collection 'registro_biometrico'
      if (db) {
        try {
          await addDoc(collection(db, 'registro_biometrico'), {
            nombre: staffName,
            evento: eventType,
            hora: serverTimestamp(),
            metodo: 'Reconocimiento Facial',
            fechaDia: todayStr
          });
        } catch (e) {
          console.error("Firestore write omitted or error:", e);
        }
      }

      setLogs([newLog, ...logs]);
      setScanStatus('success');

      setTimeout(() => {
        setScanStatus('idle');
      }, 3000);
    }, 2500); // Simulated scanning delay for UX/UI impact
  };

  // Filters
  const todayLogs = logs.filter(l => l.fechaDia === todayStr);
  const historyLogs = logs.filter(l => l.fechaDia !== todayStr);

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden pt-28 pb-16 selection:bg-[#C5B39C] selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mt-8 mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-md">
            <Fingerprint className="w-4 h-4 text-pampa-oro animate-pulse" />
            <span className="text-xs font-black tracking-[0.25em] uppercase text-muted-foreground">Terminal Biométrica La Pampa</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase italic">
            Registro Facial de Personal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
            Estación de control de accesos para contratistas y personal de servicio de la Urbanización La Pampa. Verificación biométrica instantánea.
          </p>
        </div>

        {/* Camera Error Banner */}
        {cameraError && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">Error de Cámara</p>
              <p className="text-xs text-muted-foreground mt-1">{cameraError}</p>
            </div>
            <button
              onClick={startCamera}
              className="text-[10px] font-black uppercase tracking-widest text-pampa-oro hover:underline shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Main interactive biometric row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Panel: Camera scanner */}
          <div className="lg:col-span-7 bg-card border border-border rounded-[3rem] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
            
            {/* The Camera Feed Box */}
            <div className="relative aspect-video w-full rounded-[2rem] bg-black border-2 border-border overflow-hidden flex items-center justify-center">
              
              {cameraActive ? (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  
                  {/* Digital overlay mesh */}
                  <div className="absolute inset-0 border-[3px] border-[#D4AF37]/20 m-6 rounded-2xl pointer-events-none" />
                  
                  {/* Face box tracker simulator */}
                  <div className="absolute w-44 h-44 border-2 border-dashed border-[#D4AF37]/80 rounded-full flex items-center justify-center animate-pulse pointer-events-none">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
                  </div>

                  {/* Scanning glowing laser line */}
                  {scanStatus === 'scanning' && (
                    <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_15px_#D4AF37] animate-bounce z-10" 
                         style={{ top: '10%', animationDuration: '2.5s' }} />
                  )}
                </>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <Camera className="w-12 h-12 text-[#C5B39C] mx-auto" />
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Iniciando cámara de seguridad...</p>
                </div>
              )}

              {/* Status overlays */}
              {scanStatus === 'scanning' && (
                <div className="absolute inset-0 bg-[#05140b]/40 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] animate-pulse">Escaneando Rostro...</span>
                </div>
              )}

              {scanStatus === 'success' && (
                <div className="absolute inset-0 bg-[#0b2616]/95 backdrop-blur-md flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-16 h-16 text-[#D4AF37]" />
                  <span className="text-sm font-black uppercase tracking-[0.15em] text-white">Verificación Aprobada</span>
                  <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest">{eventType} registrado</span>
                </div>
              )}
            </div>

            {/* Selector panel */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Colaborador</label>
                <select
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full h-12 px-4 bg-[#05140b] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  {mockStaff.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Evento</label>
                <div className="grid grid-cols-2 gap-2 bg-[#05140b] p-1 border border-white/10 rounded-xl">
                  {(['Ingreso', 'Salida'] as const).map((type) => {
                    const isSel = eventType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEventType(type)}
                        className={`h-10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          isSel ? 'bg-[#144229] text-[#D4AF37] border border-[#D4AF37]/40' : 'text-slate-500 hover:text-white'
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
                  className="w-full h-12 bg-[#144229] text-white border border-[#D4AF37]/50 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#0b2616] transition-colors flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Camera className="w-4 h-4 text-[#D4AF37]" />
                  Escanear
                </button>
              </div>
            </div>

          </div>

          {/* Right Panel: Today's Registry Logs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Today list */}
            <div className="bg-[#0b2616]/40 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl flex-1">
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#C5B39C] mb-6 flex justify-between items-center">
                <span>Registros de Hoy</span>
                <span className="px-3 py-1 bg-[#144229]/50 border border-[#D4AF37]/30 rounded-full text-[9px] font-black tracking-normal text-[#D4AF37]">
                  {todayLogs.length} Registrados
                </span>
              </h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                {todayLogs.length > 0 ? (
                  todayLogs.map((log) => (
                    <div key={log.id} className="bg-[#05140b]/50 border border-white/5 rounded-2xl p-4 flex justify-between items-center hover:bg-white/10 transition-colors">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white leading-none">{log.nombre}</h4>
                        <span className="text-[9px] text-[#C5B39C]/70 font-bold uppercase tracking-wider">{log.metodo}</span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-xs font-black text-[#D4AF37] leading-none">{log.hora}</span>
                        <span className={`block text-[8px] font-black uppercase tracking-wider ${
                          log.evento === 'Ingreso' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>{log.evento}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 opacity-30 text-xs">Sin registros hoy.</div>
                )}
              </div>
            </div>

            {/* Historical dropdown */}
            <div className="bg-[#0b2616]/40 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#C5B39C] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>Ver Historial de Otros Días</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`} />
              </button>

              {showHistory && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3 max-h-[200px] overflow-y-auto no-scrollbar animate-in fade-in duration-300">
                  {historyLogs.length > 0 ? (
                    historyLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-center text-xs text-slate-400 py-1 border-b border-white/5 last:border-b-0">
                        <div className="truncate pr-4 max-w-[200px]">
                          <span className="font-bold text-white">{log.nombre}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-[#C5B39C]">{log.fechaDia} • {log.hora}</span>
                          <span className={`font-black uppercase text-[8px] ml-2 ${
                            log.evento === 'Ingreso' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>{log.evento}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 opacity-30">Historial vacío.</div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
