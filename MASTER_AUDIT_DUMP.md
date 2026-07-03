# MASTER AUDIT DUMP - Urbanización La Pampa

Este documento contiene el estado actual y real del código fuente de la plataforma web de la **Urbanización La Pampa** para auditoría externa de arquitectura, UI/UX y seguridad.

---

## 1. UI/UX Y ESTÉTICA (ADN VISUAL)

### Tailwind Config: Definición de Colores de Ultra Lujo
Ubicación: `tailwind.config.ts` (colores extendidos):
```typescript
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))',
  },
  popover: {
    DEFAULT: 'hsl(var(--popover))',
    foreground: 'hsl(var(--popover-foreground))',
  },
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))',
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))',
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
  },
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
}
```

HSL Variables configuradas en `src/app/globals.css`:
```css
:root {
  /* MODO CLARO - COUNTRY CLUB LUXURY */
  --background: 36 30% 97%; /* #FAF9F6 Seda/Porcelana */
  --foreground: 150 62% 11%; /* #062113 Verde Botánico */
  --card: 0 0% 99%;
  --card-foreground: 150 62% 11%;
  --primary: 150 62% 15%;
  --primary-foreground: 36 30% 97%;
  --border: 36 15% 85%;
}

.dark {
  /* MODO OSCURO - BOTANIC GREEN DE ULTRA LUJO */
  --background: 157 61% 8%; /* #082117 Deep Botanic Green */
  --foreground: 36 30% 97%; /* Silk White */
  --card: 147 55% 10%; /* #0b2616 Forest Card */
  --card-foreground: 36 30% 97%;
  --primary: 47 62% 53%; /* #D4AF37 Gold Champagne */
  --border: 147 53% 25%;
}
```

### DOM Estructural de la Landing Page
Ubicación: `src/app/page.tsx` (`return` block):
```tsx
return (
  <div className="relative bg-[#FAF9F6] text-[#062113] dark:bg-[#082117] dark:text-[#E5DED4] min-h-screen overflow-x-hidden selection:bg-[#C5B39C] selection:text-black transition-colors duration-700">
    
    {/* Dynamic Background Glows */}
    <div 
      className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-[#D4AF37]/5 rounded-full blur-[160px] pointer-events-none transition-transform duration-1000 ease-out"
      style={{ transform: `translateY(${scrollY * 0.2}px)` }}
    />
    <div 
      className="absolute top-[40%] right-[-20%] w-[70vw] h-[70vw] bg-[#144229]/20 rounded-full blur-[180px] pointer-events-none transition-transform duration-1000 ease-out"
      style={{ transform: `translateY(${scrollY * -0.1}px)` }}
    />

    <Navbar />

    <main className="relative z-10">
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto text-center space-y-8 z-20">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#062113]/5 border border-[#062113]/10 dark:bg-white/5 dark:border-white/10 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C5B39C]">
              Santuario Residencial Privado
            </span>
          </motion.div>

          <h1 className="text-[3rem] sm:text-[5rem] lg:text-[7.5rem] font-serif leading-[0.9] tracking-tight select-none">
            <span className="block font-light italic opacity-85">
              <TextReveal delay={0.1}>La Pampa</TextReveal>
            </span>
            <span className="block font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#062113] via-[#D4AF37] to-[#062113] dark:from-[#FAF9F6] dark:via-[#DFD3C3] dark:to-[#D4AF37] mt-2">
              <TextReveal delay={0.3}>El Mejor Barrio</TextReveal>
            </span>
            <span className="block font-light italic text-[#C5B39C] mt-2">
              <TextReveal delay={0.5}>del Mundo</TextReveal>
            </span>
          </h1>
          ...
```

### Componentes de Vanguardia en Framer Motion
Ubicación: `src/app/page.tsx` (Texto Revelado e Interacción Magnética):
```typescript
// Text Reveal component for masked titles
function TextReveal({ children, className = '', delay = 0 }: { children: string; className?: string; delay?: number }) {
  const words = children.split(' ');
  return (
    <span className={`inline-flex flex-wrap overflow-hidden ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: delay + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// Magnetic Button effect for premium UX/UI
function MagneticButton({ children, className, ...props }: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 12 });
  const springY = useSpring(y, { stiffness: 120, damping: 12 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    x.set(mouseX * 0.35);
    y.set(mouseY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

---

## 2. CORE FUNCIONAL Y BASE DE DATOS

### Función de Timbrado Biométrico
Ubicación: `src/app/biometrico/page.tsx`:
```typescript
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
```

### Concierge y Subida de Daños en Firebase Storage
Ubicación: `src/app/portal/page.tsx`:
```typescript
const handleCreateTicket = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newTicketDesc) return;

  let finalUrl = '';

  if (ticketFile && storage) {
    setUploadingProgress(10);
    try {
      const fileRef = ref(storage, `mantenimiento/${Date.now()}-${ticketFile.name}`);
      const uploadTask = uploadBytesResumable(fileRef, ticketFile);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadingProgress(progress);
          }, 
          (error) => reject(error), 
          async () => {
            finalUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          }
        );
      });
    } catch (err) {
      console.warn("Storage upload failed. Fallback to placeholder image.", err);
      finalUrl = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300';
    }
  }
  ...
```

---

## 3. SEGURIDAD Y CONTROL DE ACCESOS (RBAC)

### Flujo de Validación de Primer Ingreso
Ubicación: `src/app/auth/login/page.tsx` (`handleLogin` block):
```typescript
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
```

### Reglas de Seguridad de Firestore
Ubicación: `firestore.rules`:
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isRealUser() {
      return isAuthenticated() && 
             request.auth.token.email != null;
    }
    
    function userData() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.token.email)).data;
    }

    function hasRole(role) {
      return isRealUser() && 
             exists(/databases/$(database)/documents/usuarios/$(request.auth.token.email)) &&
             role in userData().roles;
    }

    function isAdmin() {
      return hasRole('admin') || hasRole('super');
    }
    ...
```

### Reglas de Seguridad de Firebase Storage
Ubicación: `storage.rules`:
```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    function signedIn() {
      return request.auth != null;
    }

    match /informes/{allPaths=**} {
      allow read, write: if signedIn();
    }

    match /mantenimiento/{allPaths=**} {
      allow read, write: if true; // Permite subida pública de imágenes en tickets sin sesión previa forzada
    }
  }
}
```
