import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usersToCreate = [
  { username: 'admin1', email: 'admin1@lapampa.test', password: 'admin1password', role: 'admin' },
  { username: 'usuario1', email: 'usuario1@lapampa.test', password: 'usuario1password', role: 'cliente' },
  { username: 'usuario2', email: 'usuario2@lapampa.test', password: 'usuario2password', role: 'cliente' },
  { username: 'usuario3', email: 'usuario3@lapampa.test', password: 'usuario3password', role: 'cliente' },
  { username: 'usuario4', email: 'usuario4@lapampa.test', password: 'usuario4password', role: 'cliente' },
  { username: 'usuario5', email: 'usuario5@lapampa.test', password: 'usuario5password', role: 'cliente' },
];

const disciplinasData = [
  { id: 'yoga', nombre: 'Yoga', descripcion: 'Sesiones para equilibrar cuerpo y mente.' },
  { id: 'taichi', nombre: 'Tai Chi', descripcion: 'Arte marcial y meditación en movimiento.' },
  { id: 'bungee', nombre: 'Bungee Jam', descripcion: 'Entrenamiento aéreo dinámico.' },
  { id: 'kangu', nombre: 'Kangu', descripcion: 'Cardio de bajo impacto.' },
];

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seed() {
  console.log('🌱 Iniciando Data Seeding...');

  console.log('\n--- 1. Creando Usuarios en Auth y Firestore ---');
  for (const u of usersToCreate) {
    try {
      let uid = '';
      try {
        const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
        uid = cred.user.uid;
        console.log(`✅ Creado usuario en Auth: ${u.email}`);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          console.log(`⚠️ Usuario ${u.email} ya existe, haciendo login para obtener UID...`);
          const cred = await signInWithEmailAndPassword(auth, u.email, u.password);
          uid = cred.user.uid;
        } else {
          throw err;
        }
      }

      await setDoc(doc(db, 'usuarios', u.email), {
        uid: uid,
        email: u.email,
        username: u.username,
        rol: u.role,
        roles: [u.role],
        nombre: `Demo ${u.username}`,
        fechaCreacion: new Date(),
        membresiasActivas: u.role === 'cliente' ? getRandomDisciplinas() : ['todas'],
        estado: 'activo'
      }, { merge: true });
      console.log(`✅ Documento Firestore actualizado para: ${u.email}`);
      await delay(500);
    } catch (error) {
      console.error(`❌ Error con usuario ${u.email}:`, error);
    }
  }

  // Volver a iniciar sesión como admin para tener permisos de escritura en todas las colecciones
  console.log('\n--- Elevando privilegios a Admin ---');
  await signInWithEmailAndPassword(auth, 'admin1@lapampa.test', 'admin1password');
  console.log('✅ Autenticado como admin1 para poblar las colecciones.');

  console.log('\n--- 2. Creando Disciplinas ---');
  for (const d of disciplinasData) {
    try {
      await setDoc(doc(db, 'disciplinas', d.id), {
        nombre: d.nombre,
        descripcion: d.descripcion,
        activa: true
      });
      console.log(`✅ Disciplina creada: ${d.nombre}`);
    } catch (error) {
      console.error(`❌ Error creando disciplina ${d.nombre}:`, error);
    }
  }

  console.log('\n--- 3. Generando Clases (Horarios) ---');
  const clasesRef = collection(db, 'clases');
  const now = new Date();
  
  for (let i = 0; i < 10; i++) {
    const isToday = i % 2 === 0;
    const date = new Date(now);
    if (!isToday) {
      date.setDate(date.getDate() + 1);
    }
    date.setHours(8 + (i % 5) * 2, 0, 0, 0);

    const disciplina = disciplinasData[i % disciplinasData.length];

    try {
      await addDoc(clasesRef, {
        disciplinaId: disciplina.id,
        disciplinaNombre: disciplina.nombre,
        fecha: date,
        capacidadMaxima: 15,
        inscritos: Math.floor(Math.random() * 5),
        instructor: `Instructor ${i}`,
        estado: 'programada'
      });
      console.log(`✅ Clase programada: ${disciplina.nombre} para ${isToday ? 'Hoy' : 'Mañana'} a las ${date.getHours()}:00`);
    } catch (error) {
      console.error('❌ Error creando clase:', error);
    }
  }

  console.log('\n--- 4. Asignando Reservas de Prueba ---');
  const reservasRef = collection(db, 'reservas_wellness');
  const usersParaReservar = usersToCreate.filter(u => u.role === 'cliente');
  
  for (const u of usersParaReservar) {
    try {
      const disciplina = disciplinasData[Math.floor(Math.random() * disciplinasData.length)];
      await addDoc(reservasRef, {
        usuarioEmail: u.email,
        usuarioNombre: `Demo ${u.username}`,
        disciplina: disciplina.nombre,
        fechaReserva: new Date(),
        fechaClase: new Date(now.getTime() + 86400000),
        estado: 'confirmada'
      });
      console.log(`✅ Reserva asignada a ${u.username} para ${disciplina.nombre}`);
    } catch (error) {
      console.error(`❌ Error asignando reserva a ${u.username}:`, error);
    }
  }

  console.log('\n🎉 ¡Data Seeding Completado con Éxito!');
  process.exit(0);
}

function getRandomDisciplinas() {
  const shuffled = [...disciplinasData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 1).map(d => d.nombre);
}

seed().catch(console.error);
