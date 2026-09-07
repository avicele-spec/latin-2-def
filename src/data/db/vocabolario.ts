import { getDb, ora } from './client';
import { VoceVocabolario } from '../../types/db';

export async function aggiungiAlVocabolario(lemmaId: string): Promise<void> {
  const db = await getDb();
  const esistente = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM vocabolario_personale WHERE lemma_id = ?',
    [lemmaId]
  );
  if (esistente) return;
  await db.runAsync(
    'INSERT INTO vocabolario_personale (id, lemma_id, aggiunto_il) VALUES (?, ?, ?)',
    [`voc_${lemmaId}_${Date.now()}`, lemmaId, ora()]
  );
}

export async function eLemmaNelVocabolario(lemmaId: string): Promise<boolean> {
  const db = await getDb();
  const riga = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM vocabolario_personale WHERE lemma_id = ?',
    [lemmaId]
  );
  return riga !== null;
}

/** Predisposta per la schermata di ripasso spaziato di una fase futura. */
export async function leggiVocabolario(): Promise<VoceVocabolario[]> {
  const db = await getDb();
  return db.getAllAsync<VoceVocabolario>('SELECT * FROM vocabolario_personale ORDER BY aggiunto_il DESC');
}
