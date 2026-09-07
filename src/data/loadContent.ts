import dizionarioRaw from './content/dizionario.json';
import formeRaw from './content/forme.json';
import deBrevitateVitae from './content/opere/de-brevitate-vitae.json';
import { Lemma, Forma, Opera, OperaSommario, TestoLingua } from '../types/content';
import { conFallback } from '../i18n/lingue';

const DIZIONARIO = dizionarioRaw as Record<string, Lemma>;
const FORME = formeRaw as Record<string, Forma>;
const OPERE: Opera[] = [deBrevitateVitae as Opera];

const OPERE_PER_SLUG = new Map(OPERE.map((o) => [o.slug, o]));

export function elencoOpere(): OperaSommario[] {
  return OPERE.map((o) => ({
    slug: o.slug,
    titolo: o.titolo,
    autore: o.autore,
    numero_capitoli: o.libri.reduce((tot, libro) => tot + libro.capitoli.length, 0),
  }));
}

export function leggiOpera(slug: string): Opera | undefined {
  return OPERE_PER_SLUG.get(slug);
}

export function leggiLemma(lemmaId: string): Lemma | undefined {
  return DIZIONARIO[lemmaId];
}

export function leggiForma(formaId: string): Forma | undefined {
  return FORME[formaId];
}

/** Composizione completa dei tre livelli per il popup di una parola. */
export interface ParolaComposta {
  forma: Forma;
  lemma: Lemma;
}

export function componiParola(formaId: string): ParolaComposta | undefined {
  const forma = leggiForma(formaId);
  if (!forma) return undefined;
  const lemma = leggiLemma(forma.lemma_id);
  if (!lemma) return undefined;
  return { forma, lemma };
}

export function testoConFallback(testo: TestoLingua | undefined, codiceLingua: string): string {
  return conFallback(testo, codiceLingua) ?? '';
}
