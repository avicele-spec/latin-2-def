import { getDb, ora } from './client';
import { Posizione } from '../../types/content';
import { ProgressoLettura } from '../../types/db';

export async function leggiProgresso(operaSlug: string): Promise<ProgressoLettura | null> {
  const db = await getDb();
  const riga = await db.getFirstAsync<ProgressoLettura>(
    'SELECT * FROM progresso_lettura WHERE opera_slug = ?',
    [operaSlug]
  );
  return riga ?? null;
}

export async function salvaProgresso(operaSlug: string, posizione: Posizione): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO progresso_lettura (opera_slug, libro, capitolo, paragrafo, indice_parola, aggiornato_il)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(opera_slug) DO UPDATE SET
       libro = excluded.libro, capitolo = excluded.capitolo,
       paragrafo = excluded.paragrafo, indice_parola = excluded.indice_parola,
       aggiornato_il = excluded.aggiornato_il`,
    [operaSlug, posizione.libro, posizione.capitolo, posizione.paragrafo, posizione.indice_parola, ora()]
  );
}
