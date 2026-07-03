'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { 
  Fingerprint, Camera, ShieldAlert, CheckCircle2, 
  Calendar, Clock, ChevronDown, Lock, ShieldX
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
  estadoAcceso: 'Aprobado' | 'Denegado';
  motivo?: string;
}

const mockStaff = [
  'Familia Ortega - Lote 05 (Residente)',
  'Carlos Mendoza (Seguridad)',
  'Mariana Rivas (Jardinería)',
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

  // SINCRO REALTIME: Validar acceso en base a membresía / pago
  const handleScan = () => {
    if (scanStatus === 'scanning') return;
    setScanStatus('scanning');
    setErrorMessage(null);

    setTimeout(async () => {
      const timeNow = new Date().toLocaleTimeString('es-ES');
      let accessResult: 'Aprobado' | 'Denegado' = 'Aprobado';
      let denyReason = '';

      // Check payment status if it is the Resident
      if (staffName.includes('Residente')) {
        const paymentStatus = localStorage.getItem('pampa_membership_payment_status');
        if (paymentStatus !== 'paid') {
          accessResult = 'Denegado';
          denyReason = 'Expensas Pendientes (Mora Financiera)';
          setErrorMessage('Acceso Denegado: Su cuenta registra saldo pendiente en el portal de residentes.');
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

      // Add to Firestore collection 'registros_biometricos' for admin tracking
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
    }, 2000);
  };

  const todayLogs = logs.filter(l => l.fechaDia === todayStr);
  const historyLogs = logs.filter(l => l.fechaDia !== todayStr);

  return (
    <div className="bg-[#FDFBF7] text-[#333333] min-h-screen overflow-x-hidden pt-28 pb-16 selection:bg-[#C5A059]/20 selection:text-[#333333] relative">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mt-8 mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A059]/30 bg-[#FDFBF7]">
            <Fingerprint className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059]">Terminal de Control Biométrico</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#333333] uppercase italic">
            Escáner de Acceso
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] font-light max-w-xl mx-auto leading-relaxed">
            Verificación facial integrada en tiempo real. La terminal consulta automáticamente la solvencia de membresía para autorizar el ingreso al club wellness.
          </p>
        </div>

        {/* Main interactive biometric row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Panel: Camera scanner */}
          <div className="lg:col-span-7 border border-[#C5A059]/30 p-6 sm:p-8 bg-[#FDFBF7] flex flex-col justify-between relative overflow-hidden">
            
            {/* The Camera Feed Box */}
            <div className="relative aspect-video w-full border border-[#C5A059]/40 bg-[#FDFBF7] overflow-hidden flex items-center justify-center">
              
              {cameraActive ? (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  
                  {/* Digital overlay frame */}
                  <div className="absolute inset-0 border border-[#C5A059]/20 m-6 rounded-none pointer-events-none" />
                  
                  {/* Face box tracker simulator */}
                  <div className="absolute w-40 h-40 border border-[#C5A059] rounded-full flex items-center justify-center animate-pulse pointer-events-none">
                    <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
                  </div>

                  {/* Scanning line */}
                  {scanStatus === 'scanning' && (
                    <div className="absolute left-0 w-full h-0.5 bg-[#C5A059] shadow-[0_0_8px_#C5A059] animate-bounce z-10" 
                         style={{ top: '10%', animationDuration: '2s' }} />
                  )}
                </>
              ) : (
                <div className="text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#C5A059]">
                    <Camera className="w-8 h-8 stroke-[0.75]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#333333] uppercase tracking-widest font-bold">Simulación de Video Activa</p>
                    <p className="text-[9px] text-[#777777] mt-1 font-light">Listo para mapeo tridimensional de facciones</p>
                  </div>
                </div>
              )}

              {/* Status overlays */}
              {scanStatus === 'scanning' && (
                <div className="absolute inset-0 bg-[#FDFBF7]/90 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] animate-pulse">Escaneando Rostro...</span>
                </div>
              )}

              {scanStatus === 'success' && (
                <div className="absolute inset-0 bg-[#FDFBF7] border-2 border-emerald-600 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-14 h-14 text-emerald-600 stroke-[1]" />
                  <span className="text-sm font-bold uppercase tracking-[0.15em] text-[#333333]">Acceso Autorizado</span>
                  <span className="text-[9px] text-[#777777] uppercase tracking-widest">{eventType} registrado correctamente</span>
                </div>
              )}

              {scanStatus === 'denied' && (
                <div className="absolute inset-0 bg-[#FDFBF7] border-2 border-red-500 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                  <ShieldX className="w-14 h-14 text-red-500 stroke-[1]" />
                  <span className="text-sm font-bold uppercase tracking-[0.15em] text-[#333333]">Ingreso Rechazado</span>
                  <span className="text-[9px] text-red-500 uppercase tracking-widest font-bold">Mora Financiera Detectada</span>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mt-4 p-3 border border-red-200 bg-red-50/50 text-red-700 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Selector panel */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Sujeto a Validar</label>
                <select
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full h-11 px-4 bg-[#FDFBF7] border border-[#C5A059]/30 rounded-none text-[#333333] text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                >
                  {mockStaff.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-[9px] font-bold uppercase text-[#C5A059] tracking-widest">Tipo de Registro</label>
                <div className="grid grid-cols-2 gap-2 bg-[#FDFBF7] p-1 border border-[#C5A059]/30">
                  {(['Ingreso', 'Salida'] as const).map((type) => {
                    const isSel = eventType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEventType(type)}
                        className={`h-9 text-[9px] font-bold uppercase tracking-wider transition-all ${
                          isSel ? 'bg-[#333333] text-[#FDFBF7]' : 'text-[#777777] hover:text-[#333333]'
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
                  className="w-full h-11 bg-[#333333] text-[#FDFBF7] border border-[#333333] font-bold uppercase tracking-widest text-[9px] rounded-none hover:bg-transparent hover:text-[#333333] transition-colors flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-4 h-4 text-[#C5A059]" />
                  Escanear
                </button>
              </div>
            </div>

          </div>

          {/* Right Panel: Today's Registry Logs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="border border-[#C5A059]/30 p-6 sm:p-8 bg-[#FDFBF7] flex-1">
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059] mb-6 flex justify-between items-center">
                <span>Sesiones del Día</span>
                <span className="px-2.5 py-1 border border-[#C5A059]/30 text-[9px] font-bold tracking-normal text-[#C5A059]">
                  {todayLogs.length} Registros
                </span>
              </h2>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {todayLogs.length > 0 ? (
                  todayLogs.map((log) => (
                    <div key={log.id} className="border border-[#C5A059]/20 p-4 bg-[#FDFBF7] flex justify-between items-center hover:border-[#C5A059] transition-all">
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-[#333333] leading-none">{log.nombre.split(' (')[0]}</h4>
                        <span className={`text-[8px] font-bold uppercase tracking-wider ${
                          log.estadoAcceso === 'Aprobado' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {log.estadoAcceso} {log.motivo && ` - ${log.motivo}`}
                        </span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-xs font-semibold text-[#C5A059] leading-none">{log.hora}</span>
                        <span className="block text-[8px] font-bold uppercase tracking-wider text-[#777777]">{log.evento}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 opacity-40 text-xs">Sin registros de accesos hoy.</div>
                )}
              </div>
            </div>

            <div className="border border-[#C5A059]/20 p-4 bg-[#FDFBF7]">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#333333] hover:text-[#C5A059] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C5A059]" />
                  <span>Historial de Accesos</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`} />
              </button>

              {showHistory && (
                <div className="mt-4 pt-4 border-t border-[#C5A059]/10 space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
                  {historyLogs.length > 0 ? (
                    historyLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-center text-xs text-[#777777] py-1.5 border-b border-[#C5A059]/10 last:border-b-0">
                        <div className="truncate pr-4 max-w-[180px]">
                          <span className="font-semibold text-[#333333]">{log.nombre.split(' (')[0]}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-[#C5A059]">{log.fechaDia} • {log.hora}</span>
                          <span className={`font-bold uppercase text-[8px] ml-2 ${
                            log.estadoAcceso === 'Aprobado' ? 'text-emerald-600' : 'text-red-500'
                          }`}>{log.estadoAcceso}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 opacity-40">Historial vacío.</div>
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
