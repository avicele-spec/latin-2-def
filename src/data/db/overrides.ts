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

/**
 * Salva/aggiorna un solo campo, preservando gli altri eventualmente già
 * personalizzati sullo stesso target+lingua (la riga in `overrides`
 * contiene tutti i campi modificati in un unico JSON).
 */
export async function salvaCampoOverride(
  targetTipo: TargetTipo,
  targetId: string,
  lingua: string,
  campo: string,
  valore: string
): Promise<void> {
  const esistente = await leggiOverride(targetTipo, targetId, lingua);
  const campiModificati = { ...(esistente?.campi_modificati ?? {}), [campo]: valore };
  await salvaOverride(targetTipo, targetId, lingua, campiModificati, esistente?.nota_personale ?? null);
}

/**
 * Ripristina un solo campo all'originale. Se dopo la rimozione non restano
 * altri campi personalizzati per quel target+lingua, elimina la riga.
 */
export async function ripristinaCampo(
  targetTipo: TargetTipo,
  targetId: string,
  lingua: string,
  campo: string
): Promise<void> {
  const esistente = await leggiOverride(targetTipo, targetId, lingua);
  if (!esistente) return;
  const { [campo]: _rimosso, ...restanti } = esistente.campi_modificati;
  if (Object.keys(restanti).length === 0) {
    await ripristinaOriginale(targetTipo, targetId, lingua);
  } else {
    await salvaOverride(targetTipo, targetId, lingua, restanti, esistente.nota_personale);
  }
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
