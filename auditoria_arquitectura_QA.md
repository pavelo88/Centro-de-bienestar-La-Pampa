# Auditoría Maestra y QA - Urbanización La Pampa

## 1. Resumen Ejecutivo del Proyecto
La plataforma web de la **Urbanización La Pampa** es un portal interactivo de ultra-lujo y control de acceso residencial para copropietarios, personal y administradores en Pomasqui.
- **Propósito:** Ofrecer servicios de concierge, foro comunitario, reservas de spa, finanzas de expensas y control de acceso biométrico facial en una interfaz inspirada en las mejores prácticas de movimiento de Awwwards.
- **Base de Datos:** Firebase (Firestore para base de datos NoSQL y Firebase Storage para adjuntar evidencias en tickets de mantenimiento).
- **Enfoque Visual:** Paleta refinada de Verde Bosque (`#05140b`), Oro Cepillado (`#D4AF37`), Arena (`#C5B39C`) y Blanco Seda (`#FAF9F6`), estructurada con efectos de vidrio (glassmorphism), brillos interactivos y animaciones de entrada en cada vista.

---

## 2. Mapa de Rutas y Lógica de Autenticación (RBAC)

### Flujo de Acceso en Dos Pasos (Onboarding Seguro)
1. **Paso 1 (Pre-registro):** Un administrador importa masivamente o crea un registro en la colección `pre_registros` indicando `Nombre`, `Rol`, `Cédula` (que actúa como contraseña inicial) y `primerIngreso: true`.
2. **Paso 2 (Establecer Contraseña):** Al iniciar sesión en `/auth/login` con sus datos iniciales, el sistema detecta que es su primer ingreso y lo redirige a `/auth/reset-password`. Al establecer una nueva clave, se crea su cuenta definitiva en Firebase Authentication (`usuario@lapampa.com`), se guarda en la colección final `usuarios`, y se marca `primerIngreso: false`.

### Roles y Redirecciones
- **Propietario:** Acceso a la ruta `/portal` (Foro Comunitario, Concierge, Expensas, Acceso VIP QR).
- **Trabajador:** Acceso exclusivo a la terminal biométrica de control de accesos `/biometrico`.
- **Admin:** Acceso exclusivo al panel de control administrativo `/admin`.

---

## 3. Análisis Archivo por Archivo (El Core de la Auditoría)

### A. `src/app/page.tsx`
- **Propósito:** Landing page interactiva de presentación.
- **Lógica principal:** Controla el efecto parallax de scroll en la imagen de portada y maneja el estado de envío del formulario de contacto exclusivo.
- **Auditoría UX/UI:** Tipografía serif itálica muy elegante integrada con fondos degradados dorados y verdes.
- **Auditoría de Seguridad:** Pública, con redirección al Portal a través del botón de inicio.
- **Auditoría de Código:** Lógica limpia y directa, sin imports innecesarios.
- **Posibles Mejoras:** Añadir transiciones suaves de scroll adicionales usando librerías como Lenis.

### B. `src/app/auth/login/page.tsx`
- **Propósito:** Login central unificado para todos los roles.
- **Lógica principal:** Evalúa el campo `primerIngreso` de la colección `pre_registros`. Realiza el desvío a `/auth/reset-password` o el inicio de sesión nativo en Firebase Auth.
- **Auditoría UX/UI:** Interfaz oscura glassmorphism con acentos dorados y cargador de estado animado.
- **Auditoría de Seguridad:** Previene el acceso directo de cuentas no inicializadas y valida credenciales.
- **Auditoría de Código:** Contiene un efecto de sembrado automático para usuarios mock de prueba.
- **Posibles Mejoras:** Encriptación intermedia de parámetros de URL al redirigir al cambio de contraseña.

### C. `src/app/auth/reset-password/page.tsx`
- **Propósito:** Flujo de cambio de clave obligatoria.
- **Lógica principal:** Crea el usuario en Firebase Authentication y almacena el rol y cédula finales en Firestore.
- **Auditoría UX/UI:** Diseño minimalista consistente con el portal de login.
- **Auditoría de Seguridad:** Obliga a una contraseña mayor de 6 caracteres y valida la igualdad de contraseñas.
- **Auditoría de Código:** Implementado con un envoltorio `<Suspense>` para soportar los parámetros de búsqueda del cliente.
- **Posibles Mejoras:** Agregar indicador de fortaleza de contraseña interactivo en tiempo real.

### D. `src/app/portal/page.tsx`
- **Propósito:** Portal de servicios para propietarios.
- **Lógica principal:** Dividido en 4 pestañas interactivas (Comunidad, Mantenimiento con subidas reales de imágenes a Storage, Finanzas y Códigos QR VIP).
- **Auditoría UX/UI:** Tarjetas fluidas en Verde Bosque y Oro.
- **Auditoría de Seguridad:** Solo disponible para usuarios autenticados.
- **Auditoría de Código:** Manejo de estado centralizado para las pestañas de navegación.
- **Posibles Mejoras:** Modularizar cada pestaña en componentes individuales para mayor legibilidad.

### E. `src/app/bienestar/page.tsx`
- **Propósito:** Reservas del Spa y Wellness Center de la urbanización.
- **Lógica principal:** Permite al copropietario reservar clases personalizadas (Yoga, Tai Chi, Bungee) y registrarse en el sistema.
- **Auditoría UX/UI:** Estilo editorial de lujo que transmite calma y exclusividad.
- **Auditoría de Seguridad:** Restringido a usuarios validados.
- **Auditoría de Código:** Perfectamente tipado y responsivo.
- **Posibles Mejoras:** Integrar calendario visual con slots interactivos de horas.

### F. `src/app/biometrico/page.tsx`
- **Propósito:** Terminal de registro de ingreso/salida de personal y colaboradores.
- **Lógica principal:** Emplea la cámara web para simular un escaneo biométrico con retícula y láser dorado interactivo. Muestra logs diarios e históricos.
- **Auditoría UX/UI:** Look futurista y premium de control de accesos de alta tecnología.
- **Auditoría de Seguridad:** Valida que el colaborador esté pre-registrado en el sistema.
- **Auditoría de Código:** Limpio y con manejo optimizado de flujos de video locales (`navigator.mediaDevices`).
- **Posibles Mejoras:** Implementar reconocimiento facial real mediante TensorFlow.js en el cliente.

### G. `src/app/admin/page.tsx`
- **Propósito:** Dashboard administrativo.
- **Lógica principal:** Muestra estadísticas en tiempo real y contiene la interfaz de carga masiva de usuarios CSV.
- **Auditoría UX/UI:** Tarjetas de datos con bordes dorados e indicador de pulso activo en tiempo real.
- **Auditoría de Seguridad:** Validado mediante el `AdminLayout` para accesos estrictos de administradores.
- **Auditoría de Código:** Implementa carga directa a Firestore en lotes controlados.
- **Posibles Mejoras:** Añadir descarga de reportes en PDF y formato Excel directamente desde el cliente.

---

## 4. Estado de la Base de Datos (Firebase)

### Colecciones Utilizadas en Firestore
- `pre_registros`: Guarda los datos del usuario importado antes de activar su contraseña (`nombre`, `rol`, `cedula`, `primerIngreso`).
- `usuarios`: Documentos definitivos creados con el ID de correo electrónico (`nombre`, `rol`, `cedula`, `email`, `primerIngreso`).
- `mensajes_foro`: Posts del foro comunitario (`autor`, `contenido`, `fecha`, `likes`).
- `tickets_mantenimiento`: Reportes al concierge (`asunto`, `descripcion`, `imageUrl`, `fecha`).

### Estructura en Firebase Storage
- `/mantenimiento`: Directorio de lectura y escritura pública para subir fotos reales de desperfectos en los tickets.

---

## 5. Reporte de Errores Críticos y Tareas Pendientes
1. **Verificación de Sesión en Cliente:** Se requiere un middleware centralizado en Next.js (`middleware.ts`) para forzar las redirecciones de roles a nivel de servidor, evitando destellos de carga en el cliente.
2. **Encriptación de Parámetros:** La URL `/auth/reset-password?username=xxx` expone el nombre de usuario en texto plano; se sugiere codificar en Base64 o cifrar temporalmente.
3. **Validación de Roles en Storage:** Las reglas de Firebase Storage deben evolucionar de lecturas públicas a restringidas según el token del propietario.
