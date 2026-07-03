'use client';

import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AlertCircle, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const mockUsers = [
  { username: 'propietarios1', name: 'Familia Ortega - Lote 5', role: 'Propietario' },
  { username: 'propietarios2', name: 'Familia Mendoza - Lote 12', role: 'Propietario' },
  { username: 'propietarios3', name: 'Familia Rivas - Lote 8', role: 'Propietario' },
  { username: 'propietarios4', name: 'Familia Pérez - Lote 15', role: 'Propietario' },
  { username: 'propietarios5', name: 'Familia Alarcón - Lote 22', role: 'Propietario' },
  { username: 'trabajadores1', name: 'Carlos Mendoza (Seguridad)', role: 'Trabajador' },
  { username: 'trabajadores2', name: 'Mariana Rivas (Jardinería)', role: 'Trabajador' },
  { username: 'trabajadores3', name: 'Juan Diego Pérez (Mantenimiento)', role: 'Trabajador' },
  { username: 'trabajadores4', name: 'Sofía Alarcón (Limpieza)', role: 'Trabajador' },
  { username: 'trabajadores5', name: 'Ricardo Espinoza (Administración)', role: 'Trabajador' },
  { username: 'admin1', name: 'Admin Principal', role: 'Admin' },
  { username: 'admin2', name: 'Co-Administrador', role: 'Admin' }
];

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setError("Los servicios de autenticación no están listos.");
      setLoading(false);
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    try {
      // 1. Check pre_registros collection in Firestore
      const preDocRef = doc(db, 'pre_registros', cleanUsername);
      const preDocSnap = await getDoc(preDocRef);

      if (preDocSnap.exists()) {
        const preData = preDocSnap.data();

        if (preData.primerIngreso) {
          // If first login, verify password matches initial credential (which is the username/cédula)
          if (password === cleanUsername) {
            // Redirect to password reset view
            router.push(`/auth/reset-password?username=${cleanUsername}`);
            return;
          } else {
            setError("Contraseña incorrecta para el primer ingreso.");
            setLoading(false);
            return;
          }
        }
      }

      // 2. Standard login flow using Firebase Auth (email is username@lapampa.com)
      const email = `${cleanUsername}@lapampa.com`;
      const authUserCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check final user role in Firestore
      const userDocRef = doc(db, 'usuarios', email);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.rol || userData.role;

        if (role === 'Propietario') {
          router.replace('/portal');
        } else if (role === 'Trabajador') {
          router.replace('/biometrico');
        } else if (role === 'Admin') {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      } else {
        // Fallback role check using pre_registros if final doc is not fully propagated
        if (preDocSnap.exists()) {
          const role = preDocSnap.data().rol;
          if (role === 'Propietario') router.replace('/portal');
          else if (role === 'Trabajador') router.replace('/biometrico');
          else if (role === 'Admin') router.replace('/admin');
          else router.replace('/');
        } else {
          setError("Perfil de usuario no encontrado.");
        }
      }

    } catch (err: any) {
      console.error(err);
      setError("Credenciales incorrectas o usuario no registrado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#05140b] dark:bg-[#05140b] text-[#E5DED4] min-h-screen flex items-center justify-center p-4 relative selection:bg-[#C5B39C] selection:text-black">
      {/* Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#144229]/20 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md rounded-[2.5rem] bg-[#0b2616]/40 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 relative z-10">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto mb-2 flex justify-center scale-110">
            <Logo />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#144229] border border-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest mx-auto w-fit">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Acceso Seguro</span>
          </div>
          <CardTitle className="text-3xl font-serif text-white tracking-tight">Iniciar Sesión</CardTitle>
          <CardDescription className="text-[#C5B39C]/70 text-xs font-light">
            Bienvenido al portal exclusivo de la Urbanización La Pampa.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#C5B39C] px-1">Usuario / Cédula</Label>
              <Input
                type="text"
                required
                placeholder="Ej. propietarios1 o DNI"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus-visible:ring-[#D4AF37]/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#C5B39C] px-1">Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus-visible:ring-[#D4AF37]/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 text-[#C5B39C]/60 hover:text-white transition-colors"
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
              className="w-full h-14 bg-gradient-to-r from-[#144229] to-[#0b2616] border border-[#D4AF37]/50 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#0b2616] transition-all transform active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar al Portal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
