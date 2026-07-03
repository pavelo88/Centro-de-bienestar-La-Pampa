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
    title: 'Seguridad y Vigilancia 24/7',
    description: 'Seguridad perimetral avanzada, patrullas constantes y control de accesos biométrico para la tranquilidad de su familia.',
    desc: 'Seguridad perimetral avanzada, patrullas constantes y control de accesos biométrico para la tranquilidad de su familia.',
    fullDescription: 'Disponemos de un cuerpo de seguridad altamente cualificado, sistemas de cámaras de alta resolución y control de acceso biométrico inteligente en todas las entradas del barrio.',
    image: "/inspeccion.png",
    icon: ShieldCheck
  },
  {
    id: 'concierge-mantenimiento',
    title: 'Concierge & Mantenimiento',
    description: 'Resolución ágil de desperfectos en áreas comunes y asistencia exclusiva a propietarios para gestiones del día a día.',
    desc: 'Resolución ágil de desperfectos en áreas comunes y asistencia exclusiva a propietarios para gestiones del día a día.',
    fullDescription: 'Un servicio de concierge dedicado a resolver requerimientos domésticos y coordinar el mantenimiento preventivo y correctivo de las instalaciones de la urbanización.',
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
    title: 'Paisajismo y Áreas Verdes',
    description: 'Cuidado profesional de jardines, senderos ecológicos, canchas y parques que conforman el pulmón verde del barrio.',
    desc: 'Cuidado profesional de jardines, senderos ecológicos, canchas y parques que conforman el pulmón verde del barrio.',
    fullDescription: 'Mantenemos más de 20 hectáreas de espacios verdes con paisajismo de diseño, riego automatizado de última generación y senderos recreativos impecables.',
    image: "/stockl.png",
    icon: Droplets
  },
  {
    id: 'acceso-vip',
    title: 'Acceso VIP Digital',
    description: 'Generación simplificada de códigos QR temporales para visitas, proveedores y contratistas desde su móvil.',
    desc: 'Generación simplificada de códigos QR temporales para visitas, proveedores y contratistas desde su móvil.',
    fullDescription: 'Gestione de manera segura las invitaciones al lote. El código QR generado se valida instantáneamente en las terminales de la garita principal.',
    image: "/tarifas.png",
    icon: Cpu
  },
  {
    id: 'gestion-financiera',
    title: 'Gestión Financiera & Expensas',
    description: 'Transparencia total en el cobro de expensas, fondos de reserva y auditorías periódicas del consorcio.',
    desc: 'Transparencia total en el cobro de expensas, fondos de reserva y auditorías periódicas del consorcio.',
    fullDescription: 'Facilitamos el pago digital de expensas ordinarias y extraordinarias, así como el acceso a balances detallados para todos los copropietarios.',
    image: "/recambios.png",
    icon: FileText
  }
];

// Datos adicionales para el header/footer y estadísticas (sin cambios)
export const brands: string[] = [
  "Club House", "Spa Wellness", "Canchas Tenis", "Piscina Climatizada", 
  "Helipuerto VIP", "Senderos Ecológicos", "Gimnasio Premium", "Seguridad Privada", 
  "Control Biométrico", "Áreas Infantiles", "Restaurante Gourmet", "Cancha Golf"
];

export const contactInfo = {
  address: "Av. Principal del Bosque, Lote 1, Urbanización La Pampa",
  phone: "900 100 200",
  emails: ["administracion@urbanizacionlapampa.com", "concierge@urbanizacionlapampa.com"],
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
  { val: '24/7', tag: 'Seguridad', icon: ShieldCheck },
  { val: '+15', tag: 'Amenidades', icon: Settings },
  { val: '+250', tag: 'Lotes', icon: Globe },
  { val: '100%', tag: 'Exclusivo', icon: Activity },
];
