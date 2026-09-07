/**
 * Unico punto di configurazione delle lingue dell'app. Selettore lingua,
 * fallback e schermata impostazioni si popolano da qui: nessuno schermo o
 * componente deve avere un riferimento fisso a "tre lingue" o a un codice
 * lingua specifico.
 */
import * as Localization from 'expo-localization';

export interface ConfigurazioneLingua {
  codice: string;
  nome_nativo: string;
  /**
   * true per le lingue romanze: le parole del dizionario.discendenti sono
   * discendenti diretti ("Discendenti italiani/spagnoli").
   * false: sono cognati/prestiti, spesso per via dotta o tramite il
   * francese ("Parole imparentate in inglese").
   */
  romanza: boolean;
  stato: 'attiva' | 'in_preparazione';
}

export const LINGUE: ConfigurazioneLingua[] = [
  { codice: 'it', nome_nativo: 'Italiano', romanza: true, stato: 'attiva' },
  { codice: 'en', nome_nativo: 'English', romanza: false, stato: 'attiva' },
  { codice: 'es', nome_nativo: 'Español', romanza: true, stato: 'attiva' },
  { codice: 'de', nome_nativo: 'Deutsch', romanza: false, stato: 'in_preparazione' },
  { codice: 'fr', nome_nativo: 'Français', romanza: true, stato: 'in_preparazione' },
];

export const LINGUA_DI_RISERVA = 'it';

export function lingueAttive(): ConfigurazioneLingua[] {
  return LINGUE.filter((l) => l.stato === 'attiva');
}

export function configurazioneLingua(codice: string): ConfigurazioneLingua | undefined {
  return LINGUE.find((l) => l.codice === codice);
}

/**
 * Lingua da usare finché l'utente non ne ha salvata una propria (primo
 * avvio, o lettura delle impostazioni non ancora riuscita): quella del
 * dispositivo se è tra le lingue attive, altrimenti la lingua di riserva.
 * Usata sia per inizializzare i18next sia come default di `useSettingsStore`,
 * così interfaccia e contenuti partono sempre allineati.
 */
export function linguaDispositivo(): string {
  const codiciAttivi = lingueAttive().map((l) => l.codice);
  const preferita = Localization.getLocales()[0]?.languageCode;
  if (preferita && codiciAttivi.includes(preferita)) return preferita;
  return LINGUA_DI_RISERVA;
}

export function etichettaDiscendenti(codice: string): 'discendenti' | 'imparentate' {
  const config = configurazioneLingua(codice);
  return config?.romanza === false ? 'imparentate' : 'discendenti';
}

/**
 * Restituisce il valore per `codice`, con fallback a LINGUA_DI_RISERVA e poi
 * al primo valore disponibile nella mappa, così un contenuto mancante in una
 * lingua non rompe mai la UI.
 */
export function conFallback<T>(mappa: Record<string, T> | undefined, codice: string): T | undefined {
  if (!mappa) return undefined;
  if (mappa[codice] !== undefined) return mappa[codice];
  if (mappa[LINGUA_DI_RISERVA] !== undefined) return mappa[LINGUA_DI_RISERVA];
  const primaChiave = Object.keys(mappa)[0];
  return primaChiave !== undefined ? mappa[primaChiave] : undefined;
}
