/**
 * Schema SQLite per l'unico dato che cambia a runtime sul device: override
 * dell'utente, progresso di lettura, parole consultate, vocabolario
 * personale (predisposto, non ancora esposto in UI) e impostazioni.
 * Il contenuto dei testi (lemmi/forme/occorrenze) è statico e bundlato come
 * JSON — vedi src/data/loadContent.ts — non passa da qui.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS overrides (
  override_id TEXT PRIMARY KEY,
  target_tipo TEXT NOT NULL CHECK(target_tipo IN ('lemma','forma','occorrenza')),
  target_id TEXT NOT NULL,
  lingua TEXT NOT NULL,
  campi_modificati TEXT NOT NULL,
  nota_personale TEXT,
  modificato_il TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS progresso_lettura (
  opera_slug TEXT PRIMARY KEY,
  libro INTEGER NOT NULL,
  capitolo INTEGER NOT NULL,
  paragrafo INTEGER NOT NULL,
  indice_parola INTEGER NOT NULL,
  aggiornato_il TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS parole_consultate (
  occorrenza_id TEXT PRIMARY KEY,
  consultata_il TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vocabolario_personale (
  id TEXT PRIMARY KEY,
  lemma_id TEXT NOT NULL,
  aggiunto_il TEXT NOT NULL,
  facilita REAL NOT NULL DEFAULT 2.5,
  intervallo INTEGER NOT NULL DEFAULT 0,
  ripetizioni INTEGER NOT NULL DEFAULT 0,
  prossima_revisione TEXT
);

CREATE TABLE IF NOT EXISTS impostazioni (
  chiave TEXT PRIMARY KEY,
  valore TEXT NOT NULL
);
`;
