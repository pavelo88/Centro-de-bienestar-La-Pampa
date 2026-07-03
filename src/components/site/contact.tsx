'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  getLeadCooldownRemainingMs,
  leadCooldownMessage,
  markLeadSubmitted,
  validateLeadPayload,
} from '@/lib/lead-protection';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Linkedin, Loader2, Mail, MapPin, MessageCircle, Phone, PlayCircle, Send, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Mínimo 2 caracteres.' }),
  phone: z.string().min(6, { message: 'Número de contacto inválido.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  technicalRequest: z.string().min(10, { message: 'Mínimo 10 caracteres.' }),
  website: z.string().optional(),
});

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const db = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', phone: '', email: '', technicalRequest: '', website: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      if (!db) throw new Error("Firestore no está inicializado");
      const remainingMs = getLeadCooldownRemainingMs();
      if (remainingMs > 0) {
        toast({ variant: 'destructive', title: 'Espera un momento', description: leadCooldownMessage(remainingMs) });
        return;
      }

      const validationError = validateLeadPayload(values);
      if (validationError) {
        toast({ variant: 'destructive', title: 'Solicitud no enviada', description: 'Revisa los datos de contacto y el mensaje.' });
        return;
      }

      await addDoc(collection(db, 'contact_requests'), {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim().toLowerCase(),
        technicalRequest: values.technicalRequest.trim(),
        createdAt: serverTimestamp(),
        status: 'Pendiente',
        source: 'formulario-contacto',
      });

      await fetch('/api/notify-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      }).catch(() => undefined);

      markLeadSubmitted();
      toast({ title: '¡Solicitud Enviada!', description: 'Nuestro equipo se pondrá en contacto pronto.' });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error de Envío', description: 'Intenta llamar directamente o envíanos un correo.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contacto" className="pt-12 pb-20 relative z-10 px-4 md:px-6 scroll-mt-14">
      {/* CONTENEDOR MAESTRO CON EFECTO VIDRIO (GLASS) */}
      <div className="max-w-7xl mx-auto bg-white/50 dark:bg-black/20 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-[2.5rem] md:rounded-[3rem] p-4 sm:p-8 md:p-12 flex flex-col gap-10">

        <div className="text-center px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] uppercase">
            ¿Necesitas <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">atención o consultas?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">

          {/* ======================================================== */}
          {/* COLUMNA IZQUIERDA: CANALES DE ATENCIÓN Y MAPA            */}
          {/* ======================================================== */}
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[2rem] p-5 sm:p-8 shadow-xl flex flex-col gap-6 h-full">

            <div className="flex items-center justify-center w-full px-4 py-3 bg-white/90 dark:bg-black/40 border border-white/60 dark:border-white/5 rounded-2xl shadow-sm">
              <h3 className="text-lg font-black font-headline text-slate-900 dark:text-white uppercase tracking-wider">
                Canales de Comunicación
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] gap-4 items-stretch flex-grow">

              {/* Lado Correos y Redes */}
              <div className="flex flex-col gap-3">
                <a href="mailto:administracion@urbanizacionlapampa.com" className="flex-1 flex items-center gap-3 p-3 rounded-2xl bg-white/90 dark:bg-black/40 border border-white/60 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden">
                  <Mail size={16} className="text-emerald-500 shrink-0" />
                  <p className="text-[10px] sm:text-[11.5px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    administracion@urbanizacionlapampa.com
                  </p>
                </a>

                <a href="mailto:concierge@urbanizacionlapampa.com" className="flex-1 flex items-center gap-3 p-3 rounded-2xl bg-white/90 dark:bg-black/40 border border-white/60 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden">
                  <Mail size={16} className="text-emerald-500 shrink-0" />
                  <p className="text-[10px] sm:text-[11.5px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    concierge@urbanizacionlapampa.com
                  </p>
                </a>

                <div className="flex-1 flex items-center justify-center gap-6 p-3 rounded-2xl bg-white/90 dark:bg-black/40 border border-white/60 shadow-inner">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Exclusividad & Seguridad</span>
                </div>
              </div>

              {/* Lado Teléfonos */}
              <div className="flex flex-col gap-3">
                {/* OFICINA CENTRAL - CAMBIADO A LLAMADA tel: */}
                <a href="tel:+34900100200" className="flex-1 flex items-center justify-between p-3 rounded-2xl bg-white/90 dark:bg-black/40 border border-white/60 hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden">
                  <div className="flex flex-col min-w-0 pr-2">
                    <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-tighter">Administración</p>
                    <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors whitespace-nowrap">900 100 200</p>
                  </div>
                  <Phone size={16} className="text-emerald-500 shrink-0" />
                </a>

                <div className="flex-1 flex items-center justify-between p-3 rounded-2xl bg-white/90 dark:bg-black/40 border border-white/60">
                  <div className="flex flex-col min-w-0 pr-2">
                    <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-tighter">Seguridad Garita</p>
                    <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white whitespace-nowrap">Int. 1001</p>
                  </div>
                  <ShieldAlert size={16} className="text-emerald-500 shrink-0" />
                </div>
              </div>
            </div>

            {/* MAPA - CON TU NUEVA UBICACIÓN ACTUALIZADA */}
            <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-white/40 dark:border-white/10">
              <div className="w-full h-[180px] sm:h-[220px] rounded-2xl overflow-hidden relative bg-slate-200 dark:bg-muted/20 border border-white/60 dark:border-white/10 shadow-inner group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12000!2d-3.6247125!3d39.9064799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzlCsDU0JzIzLjMiTiAzwrAzNycyOS4wIlc!5e0!3m2!1ses!2ses!4v1617200000000!5m2!1ses!2ses"
                  className="w-full h-full border-0 transition-all [transition-duration:1500ms] filter grayscale-[0.8] contrast-125 sepia-[0.3] hue-rotate-[130deg] dark:invert dark:hue-rotate-180 group-hover:grayscale-0 group-hover:sepia-0 group-hover:dark:invert-0"
                  allowFullScreen
                  loading="lazy"
                  title="Ubicación La Pampa"
                ></iframe>
              </div>
              <div className="flex items-center justify-center gap-3 px-3">
                <MapPin className="text-primary shrink-0" size={18} />
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Av. Principal del Bosque, Lote 1, Urbanización La Pampa
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMNA DERECHA: FORMULARIO                              */}
          {/* ======================================================== */}
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-xl h-full flex flex-col gap-6 relative overflow-hidden">

            {/* TÍTULO DERECHO EN RECUADRO GLASS */}
            <div className="flex items-center justify-center w-full px-4 py-3 bg-white/90 dark:bg-black/40 border border-white/60 dark:border-white/5 rounded-2xl shadow-sm">
              <h3 className="text-xl sm:text-2xl font-black font-headline text-slate-900 dark:text-white uppercase tracking-tighter text-center">
                DÉJANOS TU CONSULTA
              </h3>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-grow flex flex-col">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-300 tracking-widest">Nombre / Lote</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Juan Pérez - Lote 14" {...field} className="h-12 rounded-2xl bg-white/80 dark:bg-black/40 border-white/60 dark:border-white/10 focus-visible:ring-primary/50 text-slate-900 dark:text-white shadow-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-300 tracking-widest">Teléfono</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Ej. 600 123 456" {...field} className="h-12 rounded-2xl bg-white/80 dark:bg-black/40 border-white/60 dark:border-white/10 focus-visible:ring-primary/50 text-slate-900 dark:text-white shadow-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-300 tracking-widest">Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@correo.com" {...field} className="h-12 rounded-2xl bg-white/80 dark:bg-black/40 border-white/60 dark:border-white/10 focus-visible:ring-primary/50 text-slate-900 dark:text-white shadow-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technicalRequest"
                  render={({ field }) => (
                    <FormItem className="flex-grow flex flex-col">
                      <FormLabel className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-300 tracking-widest">Mensaje o Solicitud</FormLabel>
                      <FormControl className="flex-grow">
                        <Textarea
                          placeholder="Detalla tu mensaje o requerimiento para la administración..."
                          {...field}
                          className="flex-grow min-h-[120px] sm:min-h-[140px] rounded-2xl bg-white/80 dark:bg-black/40 border-white/60 dark:border-white/10 focus-visible:ring-primary/50 resize-none p-4 text-slate-900 dark:text-white leading-relaxed shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full h-14 sm:h-16 text-sm sm:text-base font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-[#0f5b3a] hover:bg-[#0c4a2e] text-white border-none mt-2">
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isSubmitting ? 'Procesando...' : 'Enviar Solicitud'}
                </Button>
              </form>
            </Form>
          </div>

        </div>
      </div>
    </section>
  );
}
