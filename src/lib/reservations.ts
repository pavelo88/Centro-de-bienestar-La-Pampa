import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore: db } = initializeFirebase();

/**
 * Realiza una reserva segura usando una Transacción de Firestore.
 * Previene el "race condition" (múltiples usuarios reservando el último cupo al mismo tiempo).
 */
export async function bookWellnessSession(
  userId: string,
  sessionId: string,
  maxCapacity: number = 15
): Promise<{ success: boolean; message: string }> {
  
  const sessionRef = doc(db, 'reservas_wellness', sessionId);
  
  try {
    await runTransaction(db, async (transaction) => {
      const sessionDoc = await transaction.get(sessionRef);
      
      let currentAttendees: string[] = [];
      let capacityCount = 0;

      if (sessionDoc.exists()) {
        const data = sessionDoc.data();
        currentAttendees = data.attendees || [];
        capacityCount = currentAttendees.length;
      }

      // 1. Validar límite de capacidad estricto de 15 por clase
      if (capacityCount >= maxCapacity) {
        throw new Error("CAPACITY_REACHED");
      }

      // 2. Validar que el usuario no esté ya registrado
      if (currentAttendees.includes(userId)) {
        throw new Error("ALREADY_BOOKED");
      }

      // 3. Ejecutar reserva
      currentAttendees.push(userId);
      
      transaction.set(sessionRef, {
        attendees: currentAttendees,
        updatedAt: new Date(),
        maxCapacity
      }, { merge: true });
    });

    return { success: true, message: 'Reserva confirmada exitosamente.' };

  } catch (error: any) {
    if (error.message === 'CAPACITY_REACHED') {
      return { success: false, message: 'Lo sentimos, el cupo máximo de 15 personas está lleno.' };
    }
    if (error.message === 'ALREADY_BOOKED') {
      return { success: false, message: 'Ya tienes una reserva activa para esta sesión.' };
    }
    
    console.error("Transaction failed: ", error);
    return { success: false, message: 'Ocurrió un error al procesar tu reserva.' };
  }
}
