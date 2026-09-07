/**
 * Sistema di temi. Solo "chiaro" è attivo nell'interfaccia in questo
 * checkpoint (Fase 1+2); "scuro" e "seppia" sono già definiti così che il
 * selettore di Fase 3 (Impostazioni) debba solo collegarli, senza toccare
 * componenti o schema colori.
 */

export type NomeTema = 'chiaro' | 'scuro' | 'seppia';

export interface Tema {
  sfondo: string;
  carta: string;
  testo: string;
  testoTenue: string;
  bordo: string;
  accento: string;
  accentoTestoSu: string;
  bozza: string;
  overlay: string;
  ombra: string;
}

export const TEMI: Record<NomeTema, Tema> = {
  chiaro: {
    sfondo: '#FAF6EE',
    carta: '#FFFDF8',
    testo: '#2B2620',
    testoTenue: '#6B6155',
    bordo: '#E3D9C6',
    accento: '#7A3B2E',
    accentoTestoSu: '#FFFFFF',
    bozza: '#C98A3A',
    overlay: 'rgba(20, 15, 10, 0.4)',
    ombra: 'rgba(43, 38, 32, 0.16)',
  },
  scuro: {
    sfondo: '#1B1815',
    carta: '#24201B',
    testo: '#EDE6D9',
    testoTenue: '#A79C8A',
    bordo: '#3A342C',
    accento: '#D99A73',
    accentoTestoSu: '#1B1815',
    bozza: '#D99A73',
    overlay: 'rgba(0, 0, 0, 0.55)',
    ombra: 'rgba(0, 0, 0, 0.5)',
  },
  seppia: {
    sfondo: '#EFE3CB',
    carta: '#F7EFDC',
    testo: '#3D2F1F',
    testoTenue: '#7A6A4E',
    bordo: '#D9C69F',
    accento: '#8A4B2A',
    accentoTestoSu: '#FFFFFF',
    bozza: '#8A4B2A',
    overlay: 'rgba(30, 20, 10, 0.4)',
    ombra: 'rgba(61, 47, 31, 0.2)',
  },
};

export const FONT = {
  serif: 'SourceSerif4_400Regular',
  serifSemiBold: 'SourceSerif4_600SemiBold',
  serifItalic: 'SourceSerif4_400Regular_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
};

export type DimensioneTesto = 'piccolo' | 'medio' | 'grande';

/** Corpo del testo latino, in punti. La UI di contorno resta a dimensione fissa. */
export const SCALA_TESTO: Record<DimensioneTesto, { corpo: number; interlinea: number }> = {
  piccolo: { corpo: 18, interlinea: 30 },
  medio: { corpo: 21, interlinea: 36 },
  grande: { corpo: 24, interlinea: 42 },
};

export const SPAZIATURA = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RAGGIO = {
  sm: 6,
  md: 12,
  lg: 20,
  pillola: 999,
};

/**
 * Aggiunge trasparenza a un colore esadecimale `#RRGGBB` del tema (per
 * evidenziazioni/sfondi leggeri che devono restare coerenti col tema attivo
 * invece di un rgba fisso pensato solo per il tema chiaro).
 */
export function conAlpha(colore: string, alpha: number): string {
  const suffisso = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${colore}${suffisso}`;
}
