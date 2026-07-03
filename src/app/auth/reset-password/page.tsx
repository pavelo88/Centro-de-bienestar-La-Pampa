'use client';

import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { AlertCircle, Eye, EyeOff, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import React, { Suspense } from 'react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const db = useFirestore();

  const usernameParam = searchParams.get('username') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (!db || !auth) {
      setError("Servicios de Firebase no inicializados.");
      setLoading(false);
      return;
    }

    try {
      const email = `${usernameParam}@lapampa.com`;

      // 1. Get info from pre_registros
      const preDocRef = doc(db, 'pre_registros', usernameParam);
      const preDocSnap = await getDoc(preDocRef);

      if (!preDocSnap.exists()) {
        setError("El pre-registro de usuario no existe.");
        setLoading(false);
        return;
      }

      const preData = preDocSnap.data();

      // 2. Create the user in Firebase Authentication
      await createUserWithEmailAndPassword(auth, email, password);

      // 3. Create document in final 'usuarios' collection
      const userDocRef = doc(db, 'usuarios', email);
      await setDoc(userDocRef, {
        nombre: preData.nombre,
        rol: preData.rol,
        cedula: preData.cedula,
        email: email,
        primerIngreso: false
      });

      // 4. Update 'pre_registros' primerIngreso status to false
      await updateDoc(preDocRef, {
        primerIngreso: false
      });

      setSuccess(true);
      setTimeout(() => {
        // Redirect to corresponding portal depending on role
        if (preData.rol === 'Propietario') router.replace('/portal');
        else if (preData.rol === 'Trabajador') router.replace('/biometrico');
        else if (preData.rol === 'Admin') router.replace('/admin');
        else router.replace('/');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error registrando la nueva contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md rounded-[2.5rem] bg-[#0b2616]/40 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 relative z-10 animate-in zoom-in duration-300">
      <CardHeader className="text-center space-y-4 pb-4">
        <div className="mx-auto mb-2 flex justify-center scale-110">
          <Logo />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#144229] border border-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest mx-auto w-fit">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>Primer Ingreso</span>
        </div>
        <CardTitle className="text-3xl font-serif text-white tracking-tight">Establecer Contraseña</CardTitle>
        <CardDescription className="text-[#C5B39C]/70 text-xs font-light">
          Cree una contraseña segura para activar su cuenta definitiva para <span className="font-bold text-white">{usernameParam}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-[#D4AF37]" />
            <h3 className="text-xl font-bold text-white">Contraseña Guardada</h3>
            <p className="text-xs text-slate-400">Redirigiendo a su portal...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#C5B39C] px-1">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 6 caracteres"
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

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#C5B39C] px-1">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repita su contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus-visible:ring-[#D4AF37]/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 text-[#C5B39C]/60 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Guardar y Entrar'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-[#05140b] dark:bg-[#05140b] text-[#E5DED4] min-h-screen flex items-center justify-center p-4 relative selection:bg-[#C5B39C] selection:text-black">
      {/* Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#144229]/20 rounded-full blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
          <p className="text-[#C5B39C] text-xs font-black uppercase tracking-widest">Cargando...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
