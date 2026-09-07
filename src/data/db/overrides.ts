/**
 * Predisposto per l'editor di personalizzazioni (Fase 4). Un override su un
 * lemma si applica a tutte le occorrenze del corpus; uno su un'occorrenza
 * vale solo per quel punto: la UI che li usa dovrà rendere chiara questa
 * differenza, come richiesto dal documento di progetto.
 */
import { getDb, ora } from './client';
import { Override, TargetTipo } from '../../types/db';

interface RigaOverride {
  override_id: string;
  target_tipo: TargetTipo;
  target_id: string;
  lingua: string;
  campi_modificati: string;
  nota_personale: string | null;
  modificato_il: string;
}

function daRiga(riga: RigaOverride): Override {
  return { ...riga, campi_modificati: JSON.parse(riga.campi_modificati) };
}

export async function leggiOverride(
  targetTipo: TargetTipo,
  targetId: string,
  lingua: string
): Promise<Override | null> {
  const db = await getDb();
  const riga = await db.getFirstAsync<RigaOverride>(
    'SELECT * FROM overrides WHERE target_tipo = ? AND target_id = ? AND lingua = ?',
    [targetTipo, targetId, lingua]
  );
  return riga ? daRiga(riga) : null;
}

export async function salvaOverride(
  targetTipo: TargetTipo,
  targetId: string,
  lingua: string,
  campiModificati: Record<string, string>,
  notaPersonale: string | null = null
): Promise<void> {
  const db = await getDb();
  const overrideId = `${targetTipo}_${targetId}_${lingua}`;
  await db.runAsync(
    `INSERT INTO overrides (override_id, target_tipo, target_id, lingua, campi_modificati, nota_personale, modificato_il)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(override_id) DO UPDATE SET
       campi_modificati = excluded.campi_modificati,
       nota_personale = excluded.nota_personale,
       modificato_il = excluded.modificato_il`,
    [overrideId, targetTipo, targetId, lingua, JSON.stringify(campiModificati), notaPersonale, ora()]
  );
}

export async function ripristinaOriginale(
  targetTipo: TargetTipo,
  targetId: string,
  lingua: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM overrides WHERE target_tipo = ? AND target_id = ? AND lingua = ?', [
    targetTipo,
    targetId,
    lingua,
  ]);
}

export async function elencaOverrides(): Promise<Override[]> {
  const db = await getDb();
  const righe = await db.getAllAsync<RigaOverride>('SELECT * FROM overrides ORDER BY modificato_il DESC');
  return righe.map(daRiga);
}
