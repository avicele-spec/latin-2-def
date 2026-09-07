#!/usr/bin/env node
/**
 * Scheletro dello script di generazione dei contenuti (Fase 5, non ancora
 * implementato). Definisce l'interfaccia a riga di comando e i punti di
 * estensione previsti dal documento di progetto:
 *
 *   node scripts/genera-contenuti/index.mjs --testo grezzi/mio-testo.txt --slug mio-testo
 *   node scripts/genera-contenuti/index.mjs --aggiungi-lingua de
 *   node scripts/genera-contenuti/index.mjs --riprendi
 *
 * Principi da rispettare quando si implementa (vedi anche CLAUDE.md):
 *  - generazione incrementale: non rigenerare un lemma o una forma già
 *    presenti nel dizionario/forme condivisi, solo le occorrenze sono
 *    sempre nuove per definizione;
 *  - una sola chiamata multilingua per voce (tutte le lingue attive in una
 *    richiesta, mai una richiesta per lingua);
 *  - batch con salvataggio progressivo e ripresa dopo un errore;
 *  - predisposto per collegarsi in futuro a un analizzatore morfologico
 *    (tipo Morpheus/Perseus) per il livello delle forme, e a un'API di
 *    modello linguistico per l'arricchimento semantico — nessuna delle due
 *    integrazioni esiste ancora: le funzioni sotto sono stub.
 */

import { parseArgs } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const CARTELLA_CONTENUTO = path.resolve(QUI, '../../src/data/content');
const FILE_DIZIONARIO = path.join(CARTELLA_CONTENUTO, 'dizionario.json');
const FILE_FORME = path.join(CARTELLA_CONTENUTO, 'forme.json');
const CARTELLA_OPERE = path.join(CARTELLA_CONTENUTO, 'opere');
const FILE_STATO_BATCH = path.join(QUI, '.stato-batch.json');

const { values: opzioni } = parseArgs({
  options: {
    testo: { type: 'string' }, // percorso di un file grezzo in grezzi/
    slug: { type: 'string' }, // slug della nuova opera
    'aggiungi-lingua': { type: 'string' }, // codice lingua da completare su tutto il dizionario esistente
    riprendi: { type: 'boolean', default: false }, // riprende un batch interrotto da .stato-batch.json
    'dimensione-lotto': { type: 'string', default: '20' }, // quante voci generare per lotto prima di salvare
  },
});

async function leggiJson(percorso, valoreDiDefault) {
  try {
    return JSON.parse(await readFile(percorso, 'utf-8'));
  } catch (errore) {
    if (errore.code === 'ENOENT') return valoreDiDefault;
    throw errore;
  }
}

async function scriviJson(percorso, dati) {
  await writeFile(percorso, JSON.stringify(dati, null, 2) + '\n', 'utf-8');
}

/**
 * Punto di estensione: qui andrà la chiamata reale (analizzatore
 * morfologico + modello linguistico) per generare un nuovo lemma in tutte
 * le lingue attive con una sola richiesta. Per ora lancia un errore
 * esplicito invece di produrre dati finti, per non confondere uno stub con
 * un contenuto vero.
 */
async function generaLemma(_formaGrezza, _linguaAttive) {
  throw new Error(
    'generaLemma() non è implementato: collegare qui un\'API di modello linguistico. ' +
      'Vedi CLAUDE.md, sezione "Fase 5", per lo stato del progetto.'
  );
}

/** Punto di estensione: analizzatore morfologico (tipo Morpheus/Perseus) per il livello delle forme. */
async function analizzaForma(_formaGrezza, _linguaAttive) {
  throw new Error('analizzaForma() non è implementato: collegare qui un analizzatore morfologico.');
}

/** Punto di estensione: traduzione/nota contestuale per una singola occorrenza, tutte le lingue in una chiamata. */
async function generaOccorrenza(_formaGrezza, _contestoFrase, _linguaAttive) {
  throw new Error('generaOccorrenza() non è implementato.');
}

async function esisteLemma(dizionario, lemmaId) {
  return Object.prototype.hasOwnProperty.call(dizionario, lemmaId);
}

async function esisteForma(forme, formaId) {
  return Object.prototype.hasOwnProperty.call(forme, formaId);
}

/** Modalità "nuovo testo": genera solo ciò che manca nel dizionario/forme condivisi, poi le occorrenze del testo. */
async function eseguiGenerazioneTesto({ testo, slug, dimensioneLotto }) {
  if (!testo || !slug) {
    throw new Error('Servono --testo <file> e --slug <slug> per generare un nuovo testo.');
  }
  const dizionario = await leggiJson(FILE_DIZIONARIO, {});
  const forme = await leggiJson(FILE_FORME, {});
  const righeGrezze = (await readFile(testo, 'utf-8')).split('\n').filter(Boolean);

  console.log(`Lette ${righeGrezze.length} righe grezze da ${testo}.`);
  console.log(`Dizionario condiviso: ${Object.keys(dizionario).length} lemmi già presenti.`);
  console.log(`Forme condivise: ${Object.keys(forme).length} già presenti.`);
  console.log(`Dimensione lotto: ${dimensioneLotto}.`);
  console.log(
    'Generazione non ancora implementata: implementare generaLemma/analizzaForma/generaOccorrenza ' +
      'e il ciclo di batch/salvataggio/ripresa prima di usare questo comando su un testo reale.'
  );
}

/** Modalità "aggiungi lingua": scorre il dizionario esistente e genera solo i campi mancanti per la lingua data. */
async function eseguiAggiungiLingua(codiceLingua) {
  const dizionario = await leggiJson(FILE_DIZIONARIO, {});
  const lemmiMancanti = Object.entries(dizionario).filter(
    ([, lemma]) => !(codiceLingua in (lemma.etimologia?.testo ?? {}))
  );
  console.log(`Lingua richiesta: ${codiceLingua}.`);
  console.log(`Lemmi che mancano di questa lingua: ${lemmiMancanti.length} / ${Object.keys(dizionario).length}.`);
  console.log('Generazione non ancora implementata: implementare la chiamata multilingua mancante per ogni lemma.');
}

async function main() {
  if (opzioni['aggiungi-lingua']) {
    await eseguiAggiungiLingua(opzioni['aggiungi-lingua']);
    return;
  }
  if (opzioni.riprendi) {
    const stato = await leggiJson(FILE_STATO_BATCH, null);
    if (!stato) {
      console.log('Nessun batch interrotto da riprendere (.stato-batch.json non trovato).');
      return;
    }
    console.log('Ripresa di un batch interrotto: non ancora implementata.', stato);
    return;
  }
  await eseguiGenerazioneTesto({
    testo: opzioni.testo,
    slug: opzioni.slug,
    dimensioneLotto: Number(opzioni['dimensione-lotto']),
  });
}

main().catch((errore) => {
  console.error(errore.message);
  process.exitCode = 1;
});
