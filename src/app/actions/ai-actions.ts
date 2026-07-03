'use server';

import { siteAssistantFlow } from '@/ai/flows/site-assistant-flow';

export async function askSiteAssistant(message: string, pathname: string, role: string = 'Visitante') {
  try {
    const result = await siteAssistantFlow({
      message,
      pathname,
      role
    });
    return result;
  } catch (error) {
    console.error('Error in askSiteAssistant:', error);
    return 'Lo siento, ocurrió un error al intentar conectarme. Por favor, intenta de nuevo más tarde.';
  }
}
