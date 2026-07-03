'use client';

import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AlertCircle, Eye, EyeOff, Loader2, Sparkles, Fingerprint, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const mockUsers = [
  { username: 'propietarios1', name: 'Familia Ortega - Lote 5', role: 'Propietario' },
  { username: 'trabajadores1', name: 'Carlos Mendoza (Seguridad)', role: 'Trabajador' },
  { username: 'admin1', name: 'Admin Principal', role: 'Admin' }
];

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioStatus, setBioStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  // Auto-seed mock users in Firestore
  useEffect(() => {
    if (!db) return;
    const seedMocks = async () => {
      try {
        for (const u of mockUsers) {
          const docRef = doc(db, 'pre_registros', u.username);
          const snap = await getDoc(docRef);
          if (!snap.exists()) {
            await setDoc(docRef, {
              nombre: u.name,
              rol: u.role,
              cedula: u.username,
              primerIngreso: true
            });
          }
        }
      } catch (err) {
        console.warn("Error sembrando mocks:", err);
      }
    };
    seedMocks();
  }, [db]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!db || !auth) {
      setError("Servicios de autenticación no están listos.");
      setLoading(false);
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    try {
      // Standard login flow
      const email = `${cleanUsername}@lapampa.com`;
      await signInWithEmailAndPassword(auth, email, password);
      redirectByRole(cleanUsername);
    } catch (err: any) {
      console.error(err);
      setError("Credenciales incorrectas o usuario no registrado en Firebase Auth.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = () => {
    setBioStatus('scanning');
    // Simulate biometric delay
    setTimeout(() => {
      setBioStatus('success');
      setTimeout(() => {
        // En demostración, si ingresa por biometría sin escribir, lo mandamos como Admin por defecto
        const defaultRole = username ? username : 'admin1';
        redirectByRole(defaultRole);
      }, 1000);
    }, 2000);
  };

  const redirectByRole = async (username: string) => {
    if (!db) return;
    try {
      const preDocRef = doc(db, 'pre_registros', username.toLowerCase());
      const preDocSnap = await getDoc(preDocRef);
      if (preDocSnap.exists()) {
        const role = preDocSnap.data().rol;
        if (role === 'Propietario') router.replace('/portal');
        else if (role === 'Trabajador') router.replace('/biometrico');
        else if (role === 'Admin') router.replace('/admin');
        else router.replace('/');
      } else {
        // Si no existe, al menos mostrar panel admin en la demo
        router.replace('/admin');
      }
    } catch (e) {
      router.replace('/');
    }
  };

  return (
    <div className="bg-[#05140b] min-h-screen flex items-center justify-center p-4 relative selection:bg-pampa-oro/20 selection:text-white">
      {/* Glows de Océano Zen */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-pampa-oro/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Biometric Modal Overlay */}
      <AnimatePresence>
        {showBioModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => bioStatus !== 'scanning' && setShowBioModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 glass-panel border border-pampa-oro/30 p-10 rounded-3xl flex flex-col items-center justify-center gap-6 shadow-2xl"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                {bioStatus === 'idle' && (
                  <button onClick={handleBiometricLogin} className="w-24 h-24 rounded-full border border-cyan-500/50 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 hover:scale-105 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <Fingerprint className="w-12 h-12 text-cyan-400" />
                  </button>
                )}
                {bioStatus === 'scanning' && (
                  <div className="relative w-24 h-24 rounded-full border border-cyan-400 flex items-center justify-center bg-cyan-500/10">
                    <Fingerprint className="w-12 h-12 text-cyan-400" />
                    <div className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scan_1.5s_ease-in-out_infinite]" />
                  </div>
                )}
                {bioStatus === 'success' && (
                  <div className="w-24 h-24 rounded-full border-2 border-green-500 flex items-center justify-center bg-green-500/20">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-serif text-white">
                  {bioStatus === 'idle' ? 'Identidad Biométrica' : bioStatus === 'scanning' ? 'Verificando...' : 'Acceso Autorizado'}
                </h3>
                <p className="text-xs text-white/50 max-w-xs">
                  {bioStatus === 'idle' 
                    ? 'Presione la huella para ingresar al sistema mediante validación biométrica simulada.' 
                    : bioStatus === 'scanning' ? 'Conectando con base de datos descentralizada...' : 'Redirigiendo a su portal exclusivo...'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Card className="w-full max-w-md rounded-[2.5rem] glass-panel border border-white/10 shadow-2xl p-6 relative z-10">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto mb-2 flex justify-center scale-110">
            <Logo />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-900/40 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest mx-auto w-fit">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Acceso Seguro</span>
          </div>
          <CardTitle className="text-3xl font-serif text-white tracking-tight">Iniciar Sesión</CardTitle>
          <CardDescription className="text-white/50 text-xs font-light">
            Bienvenido al portal exclusivo de la Urbanización La Pampa.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-pampa-oro px-1">Usuario / Cédula</Label>
              <Input
                type="text"
                placeholder="Ej. admin1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus-visible:ring-pampa-oro/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-pampa-oro px-1">Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus-visible:ring-pampa-oro/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-200 animate-in fade-in duration-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <p className="font-light">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-cyan-900 to-[#0b2616] border border-cyan-500/30 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#0b2616] transition-all transform active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar al Portal'}
            </Button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
              <div className="relative flex justify-center text-xs"><span className="bg-[#05140b] px-2 text-white/30 uppercase tracking-widest text-[8px] font-bold">O alternativamente</span></div>
            </div>

            <Button
              type="button"
              onClick={() => setShowBioModal(true)}
              className="w-full h-14 bg-pampa-oro/10 border border-pampa-oro/30 text-pampa-oro font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-pampa-oro/20 transition-all flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-4 h-4" />
              Ingreso Biométrico Rápido (Demo)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
