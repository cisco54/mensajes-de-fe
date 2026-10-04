import { z } from 'zod';

export type Topic =
  | 'fe'
  | 'esperanza'
  | 'amor'
  | 'sanidad'
  | 'prosperidad'
  | 'proteccion'
  | 'ansiedad'
  | 'familia'
  | 'matrimonio'
  | 'jovenes'
  | 'oracion'
  | 'milagros'
  | 'fortaleza'
  | 'otro';

const scriptSamples: Record<string, { title: string; intro: string; reflection: string; verse: string; closing: string; cta: string }> = {
  fe: {
    title: 'Dios todavía tiene el control',
    intro: 'Quizás hoy estás atravesando una situación que parece no tener salida, pero la fe no se mide por lo que ves, sino por lo que crees.',
    verse: 'Todo lo puedo en Cristo que me fortalece.',
    reflection: 'La fe no es la ausencia de miedo, sino la decisión de confiar aunque el camino no esté claro. Cada paso de obediencia es un acto de confianza.',
    closing: 'No importa lo que estés viviendo. Sigue creyendo. Dios no ha terminado contigo.',
    cta: 'Si este mensaje habló a tu corazón, compártelo con alguien que necesite escucharlo.',
  },
  esperanza: {
    title: 'Tu mañana comienza hoy',
    intro: 'Hay momentos en los que el cansancio quiere ganar, pero la esperanza recuerda que cada noche termina en un nuevo amanecer.',
    verse: 'Porque yo sé los planes que tengo para ti, planes de bien y no de mal.',
    reflection: 'La esperanza no es ignorar la dificultad, es elegir ver lo que Dios puede hacer incluso en medio de ella.',
    closing: 'Respira profundo. Tu historia todavía se está escribiendo.',
    cta: 'Envíale este mensaje a alguien que necesite esperanza hoy.',
  },
  amor: {
    title: 'Amor que transforma',
    intro: 'El amor verdadero no se grita, se demuestra. Y el mejor ejemplo de amor es el que no merecíamos, pero igual nos fue dado.',
    verse: 'Porque de tal manera amó Dios al mundo.',
    reflection: 'Cuando aprendes que eres amado sin condiciones, puedes amar a otros sin miedo.',
    closing: 'Hoy decide amar como has sido amado.',
    cta: 'Comparte este mensaje con esa persona especial.',
  },
};

const defaultScript = {
  title: 'Un mensaje para tu corazón',
  intro: 'Hoy quiero recordarte que no estás solo y que cada día es una nueva oportunidad.',
  verse: 'Cualquier cosa que pidiereis en oración, creed que la recibiréis.',
  reflection: 'Lo pequeño entregado con fe se multiplica en manos de Dios.',
  closing: 'Sigue adelante con confianza.',
  cta: 'Si te gustó, compártelo y ayuda a otra persona.',
};

export function resolveTopic(raw: string): Topic {
  const value = raw.trim().toLowerCase();
  if (value in scriptSamples) return value as Topic;
  return 'otro';
}

export function generateScript(params: { topic: string; customReflection?: string; intensity: string }) {
  const topic = resolveTopic(params.topic);
  const sample = scriptSamples[topic] || defaultScript;
  const intensity = params.intensity || 'inspiradora';

  return {
    title: sample.title,
    intro: sample.intro,
    verse: sample.verse,
    reflection: params.customReflection || sample.reflection,
    closing: sample.closing,
    cta: sample.cta,
    intensity,
    topic,
  };
}

export const scriptSchema = z.object({
  topic: z.string().min(1),
  customReflection: z.string().optional(),
  intensity: z.string().optional(),
});
