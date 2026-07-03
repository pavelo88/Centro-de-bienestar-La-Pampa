/**
 * Genera un token QR dinámico para acceso físico.
 * En un entorno de producción estricto, este token se firma en Cloud Functions.
 * Para este MVP, generamos un payload codificado en Base64 con un timestamp de expiración.
 */

export interface QRTokenPayload {
  userId: string;
  email: string;
  timestamp: number;
  exp: number; // Expiración en milisegundos
  signature: string; // Firma simulada
}

const SECRET_KEY = "la-pampa-secret-mvp"; // En prod, usar variables de entorno del backend

export function generateDynamicQRToken(userId: string, email: string): string {
  const now = Date.now();
  // El código dura 60 segundos vivo (TOTP-like)
  const expiresInMs = 60 * 1000;
  
  const payload: QRTokenPayload = {
    userId,
    email,
    timestamp: now,
    exp: now + expiresInMs,
    // Simulamos un hash simple combinando los datos
    signature: Buffer.from(`${userId}-${now}-${SECRET_KEY}`).toString('base64'),
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function validateQRToken(tokenBase64: string): { valid: boolean; message: string; data?: QRTokenPayload } {
  try {
    const jsonString = Buffer.from(tokenBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonString) as QRTokenPayload;
    
    // Validar firma simulada
    const expectedSignature = Buffer.from(`${payload.userId}-${payload.timestamp}-${SECRET_KEY}`).toString('base64');
    if (payload.signature !== expectedSignature) {
      return { valid: false, message: 'Firma de código QR inválida o adulterada.' };
    }

    // Validar expiración temporal (Previene captura de pantalla compartida)
    if (Date.now() > payload.exp) {
      return { valid: false, message: 'Código QR Expirado. El cliente debe generar uno nuevo.' };
    }

    return { valid: true, message: 'Acceso Permitido', data: payload };
  } catch (err) {
    return { valid: false, message: 'Formato de código QR inválido.' };
  }
}
