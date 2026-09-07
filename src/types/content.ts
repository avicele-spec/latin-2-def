/**
 * Modello dati a tre livelli: lemma → forma → occorrenza.
 * Ogni campo che dipende dalla lingua è una mappa CodiceLingua -> valore,
 * mai un campo fisso tipo `etimologia_it` (vedi src/i18n/lingue.ts).
 */

export type CodiceLingua = string;

export type Categoria =
  | 'sostantivo'
  | 'aggettivo'
  | 'verbo'
  | 'verbo_deponente'
  | 'verbo_difettivo'
  | 'avverbio'
  | 'preposizione'
  | 'congiunzione'
  | 'pronome'
  | 'numerale'
  | 'interiezione'
  | 'nome_proprio';

export interface TestoLingua {
  [codiceLingua: string]: string;
}

export interface ListaLingua {
  [codiceLingua: string]: string[];
}

/**
 * Discendenti/cognati per lingua. `nota` è facoltativa: si valorizza solo
 * quando c'è davvero un fatto interessante da dire (falso amico, prestito
 * dotto, evoluzione curiosa), mai come riempitivo — vedi le regole di
 * contenuto in CLAUDE.md.
 */
export interface DiscendentiLingua {
  [codiceLingua: string]: { voci: string[]; nota?: string };
}

/** Livello 1 — dizionario dei lemmi, globale e condiviso tra tutti i libri. */
export interface Lemma {
  lemma_id: string;
  lemma: string;
  paradigma: string;
  categoria: Categoria;
  coniugazione_declinazione?: string;
  frequenza: number;
  significati_base: ListaLingua;
  etimologia: {
    mostrare: boolean;
    testo: TestoLingua;
    radice_indoeuropea: string | null;
  };
  discendenti: DiscendentiLingua;
}

/** Livello 2 — forme flesse, condivise da tutte le occorrenze della stessa forma. */
export interface Forma {
  forma_id: string;
  forma: string;
  lemma_id: string;
  analisi_morfologica: TestoLingua;
  ambigua: boolean;
  analisi_alternative?: TestoLingua[];
}

/** Livello 3 — occorrenza puntuale nel testo. */
export interface Occorrenza {
  tipo: 'parola';
  occorrenza_id: string;
  forma_id: string;
  analisi_scelta: number;
  traduzione_contestuale: TestoLingua;
  nota_sintattica?: TestoLingua;
  posizione: Posizione;
}

/** Un separatore/punteggiatura tra due occorrenze (non tappabile). */
export interface Separatore {
  tipo: 'separatore';
  testo: string;
}

export type ElementoTesto = Occorrenza | Separatore;

export interface Posizione {
  libro: number;
  capitolo: number;
  paragrafo: number;
  indice_parola: number;
}

export interface Paragrafo {
  numero: number;
  testo: ElementoTesto[];
  traduzione_integrale: TestoLingua;
}

export interface Capitolo {
  numero: number;
  paragrafi: Paragrafo[];
}

export interface Libro {
  numero: number;
  capitoli: Capitolo[];
}

export interface Opera {
  slug: string;
  titolo: TestoLingua;
  autore: TestoLingua;
  libri: Libro[];
}

/** Voce sommaria per la Libreria, senza caricare l'intera opera. */
export interface OperaSommario {
  slug: string;
  titolo: TestoLingua;
  autore: TestoLingua;
  numero_capitoli: number;
}
