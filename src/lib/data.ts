import {
  Activity,
  Cpu,
  Droplets,
  Factory,
  FileText,
  Globe,
  Package,
  PhoneCall,
  Settings,
  ShieldCheck,
  Wrench
} from 'lucide-react';

export interface Service {
  id: string;
  title: string;
  description: string;
  desc?: string;
  fullDescription: string;
  image: string;
  icon: any; // Usaremos el componente de React directamente
}

export const services: Service[] = [
  {
    id: 'seguridad-24-7',
    title: 'Control de Acceso Avanzado',
    description: 'Seguridad perimetral y control de accesos biométrico para la tranquilidad absoluta de nuestros clientes.',
    desc: 'Seguridad perimetral y control de accesos biométrico para la tranquilidad absoluta de nuestros clientes.',
    fullDescription: 'Disponemos de un cuerpo de recepción altamente cualificado y control de acceso biométrico inteligente en todas las entradas del centro.',
    image: "/inspeccion.png",
    icon: ShieldCheck
  },
  {
    id: 'concierge-mantenimiento',
    title: 'Concierge Premium',
    description: 'Asistencia exclusiva a nuestros miembros para gestiones del día a día y reservaciones.',
    desc: 'Asistencia exclusiva a nuestros miembros para gestiones del día a día y reservaciones.',
    fullDescription: 'Un servicio de concierge dedicado a resolver requerimientos personales y coordinar sus disciplinas wellness.',
    image: "/mantenimiento.png",
    icon: Wrench
  },
  {
    id: 'wellness-spa',
    title: 'Wellness Center & Spa',
    description: 'Acceso a clases dirigidas de Yoga, Tai Chi, Bungee Fitness y tratamientos relajantes de nivel 5 estrellas.',
    desc: 'Acceso a clases dirigidas de Yoga, Tai Chi, Bungee Fitness y tratamientos relajantes de nivel 5 estrellas.',
    fullDescription: 'Disfrute de nuestras modernas instalaciones deportivas y cabinas de relajación, guiadas por instructores internacionales de primer nivel.',
    image: "/cogeneracion.png",
    icon: Activity
  },
  {
    id: 'areas-verdes',
    title: 'Atmósfera Zen',
    description: 'Espacios meticulosamente diseñados para fomentar la calma y la conexión cuerpo-mente.',
    desc: 'Espacios meticulosamente diseñados para fomentar la calma y la conexión cuerpo-mente.',
    fullDescription: 'Nuestras instalaciones cuentan con un diseño interior zen, aromaterapia y música binaural para una inmersión total.',
    image: "/stockl.png",
    icon: Droplets
  },
  {
    id: 'acceso-vip',
    title: 'Acceso QR Dinámico',
    description: 'Su pase de entrada digital, rotativo y altamente seguro, generado directamente desde la app.',
    desc: 'Su pase de entrada digital, rotativo y altamente seguro, generado directamente desde la app.',
    fullDescription: 'Gestione de manera segura su acceso al centro. El código QR generado se valida instantáneamente en los pasillos motorizados de recepción.',
    image: "/tarifas.png",
    icon: Cpu
  },
  {
    id: 'gestion-financiera',
    title: 'Membresías Automatizadas',
    description: 'Transparencia total en el cobro de planes y notificaciones automáticas de renovación.',
    desc: 'Transparencia total en el cobro de planes y notificaciones automáticas de renovación.',
    fullDescription: 'Facilitamos el pago digital de su membresía y acceso a promociones exclusivas para clientes frecuentes y referidos.',
    image: "/recambios.png",
    icon: FileText
  }
];

// Datos adicionales para el header/footer y estadísticas (sin cambios)
export const brands: string[] = [
  "Yoga Zen", "Spa Wellness", "Bungee Fitness", "Tai Chi", 
  "Kangoo Jumps", "Meditación", "Gimnasio Premium", "Privacidad Total", 
  "Control Biométrico", "Nutrición VIP", "Restaurante Gourmet", "Coaching"
];

export const contactInfo = {
  address: "Av. Principal del Bosque, Edificio Wellness, Centro de Bienestar La Pampa",
  phone: "900 100 200",
  emails: ["info@lapampawellness.com", "membresias@lapampawellness.com"],
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12000!2d-3.6247125!3d39.9064799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzlCsDU0JzIzLjMiTiAzwrAzNycyOS4wIlc!5e0!3m2!1ses!2ses!4v1617200000000!5m2!1ses!2ses",
};

export const socialLinks = {
  facebook: "#",
  instagram: "#",
  linkedin: "#"
};

export const navLinks = [
  { href: "/#disciplinas", label: "Servicios" },
  { href: "/bienestar", label: "Exclusividades" },
  { href: "/#contacto", label: "Contacto" },
];

export const stats = [
  { val: '4', tag: 'Disciplinas', icon: Activity },
  { val: '15', tag: 'Aforo Máximo', icon: Settings },
  { val: 'Premium', tag: 'Membresías', icon: Globe },
  { val: '100%', tag: 'Exclusivo', icon: ShieldCheck },
];
