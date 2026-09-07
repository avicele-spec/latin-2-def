import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

const NOME_DB = 'lector.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Apre (o riusa) la connessione al database, applicando lo schema in modo
 * idempotente. `expo-sqlite` non ha un'implementazione web: sul target web
 * (usato in questo progetto solo per verifiche visive rapide, non come
 * piattaforma di destinazione) la connessione fallisce subito invece di
 * restare appesa, così i chiamanti (tutti già con fallback ai default o
 * scritture "fire and forget") degradano senza bloccare l'avvio dell'app.
 * Su iOS/Android funziona normalmente.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (Platform.OS === 'web') {
    return Promise.reject(new Error('expo-sqlite non è disponibile sul target web.'));
  }
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(NOME_DB).then(async (db) => {
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync(SCHEMA_SQL);
      return db;
    });
  }
  return dbPromise;
}

export function ora(): string {
  return new Date().toISOString();
}
