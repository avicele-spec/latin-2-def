/** Tipi per i dati mutabili dell'utente, persistiti in SQLite (src/data/db). */

export type TargetTipo = 'lemma' | 'forma' | 'occorrenza';

export interface Override {
  override_id: string;
  target_tipo: TargetTipo;
  target_id: string;
  lingua: string;
  campi_modificati: Record<string, string>;
  nota_personale: string | null;
  modificato_il: string;
}

export interface ProgressoLettura {
  opera_slug: string;
  libro: number;
  capitolo: number;
  paragrafo: number;
  indice_parola: number;
  aggiornato_il: string;
}

export interface VoceConsultata {
  occorrenza_id: string;
  consultata_il: string;
}

/** Predisposta per il ripasso spaziato (SM-2 semplificato); non ancora usata in UI. */
export interface VoceVocabolario {
  id: string;
  lemma_id: string;
  aggiunto_il: string;
  facilita: number;
  intervallo: number;
  ripetizioni: number;
  prossima_revisione: string | null;
}

export type ChiaveImpostazione =
  | 'lingua'
  | 'dimensione_testo'
  | 'tema'
  | 'mostra_parole_consultate'
  | 'mostra_macron';

export interface Impostazioni {
  lingua: string;
  dimensione_testo: 'piccolo' | 'medio' | 'grande';
  tema: 'chiaro' | 'scuro' | 'seppia';
  mostra_parole_consultate: boolean;
  mostra_macron: boolean;
}

export const IMPOSTAZIONI_DEFAULT: Impostazioni = {
  lingua: 'it',
  dimensione_testo: 'medio',
  tema: 'chiaro',
  mostra_parole_consultate: true,
  mostra_macron: false,
};
