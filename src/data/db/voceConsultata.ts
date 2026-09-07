import { getDb, ora } from './client';

export async function segnaConsultata(occorrenzaId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO parole_consultate (occorrenza_id, consultata_il) VALUES (?, ?) ON CONFLICT(occorrenza_id) DO NOTHING',
    [occorrenzaId, ora()]
  );
}

/** Ritorna l'insieme degli id delle occorrenze già consultate, per marcarle nel testo. */
export async function leggiOccorrenzeConsultate(): Promise<Set<string>> {
  const db = await getDb();
  const righe = await db.getAllAsync<{ occorrenza_id: string }>(
    'SELECT occorrenza_id FROM parole_consultate'
  );
  return new Set(righe.map((r) => r.occorrenza_id));
}
