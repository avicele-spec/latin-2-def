import { getDb } from './client';
import { IMPOSTAZIONI_DEFAULT, Impostazioni } from '../../types/db';
import { linguaDispositivo } from '../../i18n/lingue';

export async function leggiImpostazioni(): Promise<Impostazioni> {
  const db = await getDb();
  const righe = await db.getAllAsync<{ chiave: string; valore: string }>(
    'SELECT chiave, valore FROM impostazioni'
  );
  const salvate: Record<string, string> = {};
  for (const r of righe) salvate[r.chiave] = r.valore;

  return {
    lingua: salvate.lingua ?? linguaDispositivo(),
    dimensione_testo:
      (salvate.dimensione_testo as Impostazioni['dimensione_testo']) ??
      IMPOSTAZIONI_DEFAULT.dimensione_testo,
    tema: (salvate.tema as Impostazioni['tema']) ?? IMPOSTAZIONI_DEFAULT.tema,
    mostra_parole_consultate:
      salvate.mostra_parole_consultate !== undefined
        ? salvate.mostra_parole_consultate === '1'
        : IMPOSTAZIONI_DEFAULT.mostra_parole_consultate,
    mostra_macron:
      salvate.mostra_macron !== undefined
        ? salvate.mostra_macron === '1'
        : IMPOSTAZIONI_DEFAULT.mostra_macron,
  };
}

export async function scriviImpostazione<K extends keyof Impostazioni>(
  chiave: K,
  valore: Impostazioni[K]
): Promise<void> {
  const db = await getDb();
  const valoreSerializzato = typeof valore === 'boolean' ? (valore ? '1' : '0') : String(valore);
  await db.runAsync(
    'INSERT INTO impostazioni (chiave, valore) VALUES (?, ?) ON CONFLICT(chiave) DO UPDATE SET valore = excluded.valore',
    [chiave, valoreSerializzato]
  );
}

const CHIAVE_ONBOARDING = 'onboarding_completato';

/** Non fa parte di `Impostazioni` (non è una preferenza dell'utente): stessa tabella, chiave a parte. */
export async function leggiOnboardingCompletato(): Promise<boolean> {
  const db = await getDb();
  const riga = await db.getFirstAsync<{ valore: string }>('SELECT valore FROM impostazioni WHERE chiave = ?', [
    CHIAVE_ONBOARDING,
  ]);
  return riga?.valore === '1';
}

export async function segnaOnboardingCompletato(): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO impostazioni (chiave, valore) VALUES (?, ?) ON CONFLICT(chiave) DO UPDATE SET valore = excluded.valore',
    [CHIAVE_ONBOARDING, '1']
  );
}
