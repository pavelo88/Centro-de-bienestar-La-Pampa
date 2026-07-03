# Centro de Bienestar La Pampa - Plataforma Premium

Sistema de gestión y portal web para el **Centro de Bienestar La Pampa**, un ecosistema wellness comercial de ultra-lujo. Esta plataforma maneja las suscripciones de los clientes VIP, reservas de clases con control estricto de aforo, generación de accesos dinámicos y validación biométrica.

## 🚀 Tecnologías Principales

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion.
- **Backend (BaaS):** Firebase (Firestore, Authentication, Cloud Functions recomendadas para producción).
- **Iconografía:** Lucide React.
- **Componentes UI:** Shadcn/ui (Radix UI).
- **Generación QR:** qrcode.react.

## 💎 Características Principales (Core Features)

### 1. Sistema de Reservas Transaccional
Control estricto de aforo para las diferentes disciplinas wellness (Yoga, Tai Chi, Bungee, Kangoo Jumps).
- **Límite Estricto:** Máximo 15 personas por sesión.
- **Seguridad Concurrente:** Utiliza `runTransaction` de Firestore para prevenir problemas de concurrencia (Race Conditions), asegurando que el cupo número 15 solo pueda ser tomado por una única petición atómica.

### 2. Acceso Dinámico QR (Anti-Fraude)
Generación de pases digitales para el ingreso a las instalaciones.
- **Token Rotativo (TOTP):** Los códigos QR generados rotan y expiran automáticamente cada 60 segundos.
- **Seguridad Física:** Al rotar cada minuto, se previene que los clientes compartan capturas de pantalla de sus códigos QR con terceros.

### 3. Portal del Cliente y Gestión Financiera
Un panel de control donde el cliente puede gestionar su vida en el centro.
- **Estado de Membresía:** El cliente puede visualizar el estado de sus pagos (Membresía Black).
- **Bloqueo Inteligente:** Si la membresía registra mora financiera, el sistema inhabilita la generación de códigos QR y revoca el acceso en las terminales biométricas automáticamente.
- **Promociones y Referidos:** Sistema de códigos únicos de invitación para adquirir beneficios (Ej. "15 días gratis").

### 4. Módulo Biométrico para Recepción
Panel simulado para las terminales de ingreso del centro.
- **Validación Facial:** Integración visual que escanea y contrasta la identidad del usuario contra la base de datos de clientes VIP.
- **Interconexión Financiera:** El ingreso es aprobado o denegado en tiempo real basado en el estado contable y el rol del usuario.

## 🔐 Arquitectura de Datos y Reglas de Seguridad (Firestore Rules)

El ecosistema cuenta con políticas estrictas de control de acceso a nivel de base de datos (RLS). Existen roles jerárquicos: `isClient`, `isStaff`, y `isAdmin`.

- `reservas_wellness`: Lectura y escritura pública/autenticada, pero **limitada por transacciones de código** para garantizar que el array de asistentes nunca supere los 15 miembros.
- `accesos_vip`: Los clientes solo pueden leer y crear sus propios accesos. Recepción puede consultar y actualizar su uso.
- `mensajes_foro`: Lectura abierta para la comunidad del bienestar, creación restringida a clientes autenticados.
- `registros_biometricos` y `registro_pagos`: Privilegios exclusivos para `isAdmin` (y creación automática controlada).

## 🛠 Instalación y Desarrollo Local

1. **Clonar el repositorio y acceder a la carpeta:**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd centro-bienestar-la-pampa
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Firebase:**
   Asegúrate de colocar las credenciales web en tu archivo `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗 Notas para Puesta en Producción

- **Firmas Criptográficas (Cloud Functions):** En el MVP, el token QR se ofusca en el cliente usando un secret temporal. En producción, la generación del Token QR y su firma criptográfica DEBE trasladarse a una *Cloud Function* por seguridad.
- **Pagos Reales:** La pasarela de membresías y el cambio de estados en `registro_pagos` debe interconectarse con webhooks de proveedores de pago como Stripe o Dlocal.
