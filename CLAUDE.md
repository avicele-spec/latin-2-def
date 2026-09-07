# Lector (mobile) — guida al progetto

App mobile (iOS + Android, Expo/React Native) per leggere testi latini in
lingua originale con supporto interattivo: si tocca una parola e si apre una
scheda con lemma, paradigma, analisi morfologica, traduzione contestuale,
etimologia e discendenti/cognati nelle lingue moderne attive.

Questo file è la memoria di progetto: raccoglie le decisioni tecniche prese,
le regole di contenuto da rispettare in ogni aggiunta futura, e — in fondo —
un registro delle modifiche proposte dall'utente nel tempo. Prima di
modificare struttura dati, contenuti o interfaccia, leggilo.

Il documento di specifica originale (visione completa, fasi 1-6) resta il
riferimento di lungo periodo; qui sotto sono registrate le decisioni prese
nei checkpoint completati finora e ciò che ancora manca.

## Stato del progetto

Costruito finora:
- **Fase 1+2** (fondamenta + esperienza di lettura). Libreria → Capitoli →
  Lettura, parole tappabili, popup completo, sulle prime 5 frasi del
  capitolo 1 del *De Brevitate Vitae* di Seneca (84 lemmi, 94 forme, 110
  occorrenze, IT/EN/ES).
- **Fase 3** (traduzione e impostazioni). `TranslationScreen` con modalità
  "a fronte" e "solo traduzione", si apre posizionata sul paragrafo che si
  stava leggendo, toccare un paragrafo torna al testo latino corrispondente.
  `SettingsScreen` con lingua (cambia interfaccia e contenuti insieme, come
  richiesto) e dimensione del testo, entrambe realmente funzionanti; toggle
  "segna le parole consultate". **Il selettore di tema (chiaro/scuro/
  seppia) non è incluso**: il documento originale elenca "temi" sotto Fase 6
  (rifinitura), non Fase 3 ("impostazioni con cambio *lingua* funzionante"),
  e ogni componente oggi importa `TEMI.chiaro` come costante di modulo — per
  renderlo davvero cambiabile serve prima il refactor a tema reattivo
  descritto sotto "Prossimi passi". Aggiungere un selettore che non cambia
  nulla sarebbe stato peggio che non aggiungerlo.

Non ancora costruito (fasi successive, da riprendere una alla volta):
- **Fase 4** — editor delle personalizzazioni (override su lemma/forma/
  occorrenza), indicatori "modificato", ripristino, import/export JSON. Le
  tabelle SQLite (`overrides`) e le funzioni di lettura/scrittura
  (`src/data/db/overrides.ts`) esistono già; manca solo l'interfaccia.
- **Fase 5** — script di generazione reale: `scripts/genera-contenuti/`
  contiene solo lo scheletro (CLI, controllo incrementale, modalità
  aggiungi-lingua, batch/ripresa), tutto stubbato.
- **Fase 6** — rifinitura: onboarding, accessibilità, performance su
  capitoli lunghi, **auto-corsivo delle citazioni tra apici** nel testo di
  etimologia/discendenti (vedi sezione apposita più sotto), icona app e
  splash artwork dedicati (per ora solo i colori sono personalizzati, le
  immagini sono ancora il placeholder di default di Expo), e il
  **refactor a tema reattivo** (`useTema()` al posto di `TEMI.chiaro`
  importato come costante in ogni schermata/componente — tocca circa 9
  file: tutte le schermate, `ParagraphNav`, `WordToken`, `ParagraphLine`,
  `WordPopupSheet`, `PopupSection`, `RootNavigator`) prima di poter
  collegare il selettore scuro/seppia già presente in `SettingsScreen`.

## Decisioni tecniche prese (e perché)

1. **Contenuto come JSON bundlato, non SQLite.** `src/data/content/*.json`
   (dizionario, forme, opere) sono caricati in memoria all'avvio
   (`src/data/loadContent.ts`) e mai scritti a runtime. `expo-sqlite`
   (`src/data/db/`) è riservato ai dati che *cambiano sul device*: override,
   vocabolario personale, progresso di lettura, parole consultate,
   impostazioni. Motivo: il contenuto è statico e generato offline (come da
   documento §1); un DB relazionale per dati sola-lettura aggiunge solo
   complessità di migrazione, mentre le mappe in memoria bastano per un
   corpus di questa scala e funzionano identicamente su nativo e sul
   preview `expo start --web` (dove `expo-sqlite` non è disponibile). Se in
   futuro (56 libri) servisse ricerca full-text nel corpus, si può
   indicizzare in SQLite senza toccare il modello a tre livelli.
2. **Discendenti arricchiti rispetto al documento originale.** Lo schema del
   documento (§2.1) prevede `discendenti: { it: string[], ... }`, una
   semplice lista. Qui `discendenti` è invece
   `{ [lingua]: { voci: string[]; nota?: string } }` — stessa idea di mappa
   lingua→valore, ma con una `nota` testuale opzionale per lingua. Motivo:
   il corpus di partenza (migrato dall'app web precedente, vedi sotto) ha
   note ricche e verificate nel tempo (falsi amici, prestiti dotti,
   evoluzioni curiose) che sarebbe stato uno spreco appiattire in un
   semplice elenco. La `nota` va valorizzata solo quando c'è davvero
   qualcosa di interessante da dire, mai come riempitivo.
3. **Dati di esempio = contenuto reale migrato, non inventato.** Le prime 5
   frasi del capitolo 1 del *De Brevitate Vitae* (84 lemmi) vengono dal
   repository web precedente (`avicele-spec/latin`), dove erano state
   curate e corrette nel tempo in italiano. Le traduzioni inglesi e spagnole
   sono state scritte per questo progetto (nessuna chiamata AI a runtime,
   in linea col documento). **L'italiano resta la lingua di riferimento**:
   se noti un'imprecisione, correggi prima lì. Le voci EN/ES sono corrette
   ma meno elaborate per scelta esplicita (documento §3).
4. **Verifica visiva in sandbox via `expo start --web`.** Il codice è React
   Native puro (nessuna dipendenza web-only nei componenti); il target web
   è stato usato solo per gli screenshot di verifica in un ambiente senza
   simulatori iOS/Android. Il test reale va fatto con `npx expo start` +
   Expo Go, o `expo run:ios` / `expo run:android`.
5. **Font**: niente font di sistema (Iowan/Palatino non garantiti su
   Android). Testo latino in **Source Serif 4**, interfaccia in **Inter**
   (`@expo-google-fonts/*`, caricati in `App.tsx`).
6. **Tema**: solo il tema chiaro (pergamena, `TEMI.chiaro` in
   `src/theme/tokens.ts`) è collegato all'interfaccia. Scuro e seppia sono
   già definiti nello stesso file, pronti per essere agganciati quando si
   costruirà la schermata Impostazioni (Fase 3).
7. **Branch**: si lavora su `claude/app-generazione-estetica` (repository
   `avicele-spec/latin-2-def`, nato vuoto). Nessuna pull request finché non
   richiesta esplicitamente.
8. **Popup senza backdrop modale.** Il documento chiede sia che il popup si
   chiuda con "swipe verso il basso o tap fuori", sia che toccare un'altra
   parola mentre è aperto ne aggiorni il contenuto senza chiuderlo. Con
   `@gorhom/bottom-sheet` le due cose sono in conflitto: il backdrop
   standard (necessario per "tap fuori chiude") intercetta *tutti* i tocchi
   sull'area dietro al foglio, comprese le parole rimaste visibili sopra di
   esso — quindi "tocca un'altra parola" smetterebbe di funzionare. Ho
   scelto di non renderizzare alcun backdrop: il testo resta sempre
   interattivo anche a popup aperto (la funzione più specifica e testata
   esplicitamente nel documento), la chiusura avviene con lo swipe verso il
   basso sulla maniglia (nativo di gorhom) o con la "×" aggiunta
   nell'intestazione del popup. "Tap fuori per chiudere" non è quindi
   implementato: se in una fase successiva serve, va costruito un backdrop
   "parziale" fatto a mano (solo sotto la parola visibile), non quello di
   libreria.
9. **Una scrittura SQLite non deve mai bloccare un effetto già visibile.**
   Bug reale trovato verificando la Fase 3: `impostaLingua` faceva
   `set({lingua}); await scriviImpostazione(...); await
   i18n.changeLanguage(...)` — sul target web, dove `expo-sqlite` non
   c'è, `scriviImpostazione` rifiuta e `i18n.changeLanguage` non veniva mai
   chiamato: lo stato interno cambiava (la spunta si spostava) ma
   l'interfaccia restava nella lingua sbagliata. Stesso pattern nel
   pulsante "salva nel vocabolario". Regola per ogni azione futura che
   scrive in SQLite: prima applica tutto ciò che ha effetto visibile
   (`set(...)`, `i18n.changeLanguage(...)`, ecc.), *poi* prova a
   persistere in un `try/catch` che al massimo logga un avviso — mai
   `await` diretto su una scrittura DB prima di un effetto che l'utente
   deve vedere subito. Vedi `salvaSenzaBloccare` in
   `src/store/useSettingsStore.ts`.

## Modello dati

Tre livelli — vedi `src/types/content.ts` per i tipi TypeScript completi:

```
LEMMA  (src/data/content/dizionario.json)   → mai cambia, condiviso tra libri
  └─ FORMA  (src/data/content/forme.json)   → dipende dalla flessione
      └─ OCCORRENZA (src/data/content/opere/<slug>.json) → dipende dal punto nel testo
```

Composizione per il popup: `componiParola(formaId)` in `src/data/loadContent.ts`
risale da forma a lemma; l'occorrenza (già in mano a chi ha in mano il
paragrafo) fornisce il resto. Vedi `src/components/popup/WordPopupSheet.tsx`.

Stato utente (SQLite, `src/data/db/`): `overrides`, `progresso_lettura`,
`parole_consultate`, `vocabolario_personale` (predisposta per ripasso
spaziato SM-2, non ancora esposta in UI), `impostazioni`.

Lingue attive: **unico file di configurazione** `src/i18n/lingue.ts` — non
scrivere mai un riferimento fisso a "tre lingue" in nessun componente o
schermata; tutto (selettore, etichetta discendenti/imparentate, fallback)
si legge da lì.

## Regole di contenuto

Le stesse regole già valide nel dizionario del vecchio repository web,
adattate al nuovo schema multilingua. Valgono per **ogni** voce scritta o
corretta da qui in avanti in `src/data/content/dizionario.json`,
`forme.json` e `opere/*.json`, non solo per quelle già presenti.

- **Niente riferimenti a un testo o capitolo specifico** nell'etimologia o
  nei significati di base del dizionario (`Lemma`): sono condivisi tra tutti
  i libri del corpus. Un riferimento specifico ("qui Seneca...") va solo
  nella `traduzione_contestuale` o `nota_sintattica` della singola
  `Occorrenza`.
- **Niente rimandi interni tra voci** ("vedi voce 'X'", "come già visto"):
  ogni voce deve leggersi da sola.
- **Niente radice ricostruita in protoindoeuropeo** (niente forme con
  asterisco tipo `*kwo-`): l'etimologia si ferma al latino. È invece un buon
  dettaglio menzionare un vero cognato attestato in un'altra lingua
  indoeuropea (es. l'inglese `long` per `longus`), sempre specificando se è
  un cognato ereditario o un prestito dotto — sono fatti diversi e vanno
  distinti onestamente (non tutte le parole inglesi/spagnole "imparentate"
  sono arrivate per la stessa via).
- **Attenzione ai falsi amici e alle omonimie**, specialmente in spagnolo:
  es. lo spagnolo comune `largo` (lungo) NON discende da `longus` ma da
  `largus` (abbondante); i due `real` spagnoli (`res` vs `rex/regalis`) sono
  parole diverse. Verifica sempre la filiazione reale prima di elencare un
  discendente — meglio una voce corta e vera che una lunga e sbagliata.
- **Citazione del lemma in stile dizionario classico**: sostantivi
  (nominativo + genitivo, es. `pars, partis`), aggettivi per tipo di
  declinazione (es. `longus, -a, -um`; `brevis, -e`; `sapiens, sapientis`),
  verbi regolari con le 5 parti del tema (es. `destituo, destituis,
  destitui, destitutum, destituere`), deponenti con le 4 parti (es.
  `conqueror, conquereris, conquestus sum, conqueri`), difettivi solo con
  le forme davvero attestate. Il campo `paradigma` in `Lemma` contiene
  esattamente questa citazione (uguale al campo `lemma`).
- **`etimologia.mostrare`**: `false` solo quando la parola è pressoché
  identica alla lingua moderna e non c'è alcun salto semantico/fonetico che
  aiuti a ricordarla (tipicamente parole funzionali molto brevi: `et`, `in`,
  `non`...). Negli altri casi `true`. Non è un giudizio di "quanto è
  interessante il fatto", ma di "serve per ricordare la parola".
- **`discendenti[lingua].nota`**: valorizzala solo quando c'è davvero
  qualcosa da dire (falso amico, prestito dotto tardo, evoluzione di
  significato curiosa, contrasto con una parola simile). Una voce con poco
  da dire resta con `nota` assente o breve — mai riempitiva.
- **Apostrofi e citazioni**: nei testi di `etimologia` e nelle `nota` dei
  discendenti, i termini citati vanno tra apici dritti singoli (`'gallico'`)
  per restare pronti a un componente di auto-corsivo (come nell'app web
  precedente) che non è ancora stato costruito in questa app (è nella lista
  Fase 6). Le elisioni italiane/spagnole (`l'aggettivo`, `un'idea`) vanno
  scritte con l'apostrofo tipografico `'` (U+2019), mai con l'apice dritto,
  altrimenti quando il componente verrà costruito romperà l'accoppiamento
  delle citazioni.

## Struttura cartelle

```
src/
  navigation/     RootNavigator (native-stack) + tipi delle route
  screens/        LibraryScreen, ChaptersScreen, ReadingScreen,
                  TranslationScreen, SettingsScreen
  components/
    reading/      WordToken, ParagraphLine, ParagraphNav
    popup/        WordPopupSheet (bottom sheet), PopupSection
  store/          useSettingsStore, useReadingStore (zustand)
  data/
    content/      JSON statici (dizionario, forme, opere/*)
    loadContent.ts
    db/           schema SQLite + helper di lettura/scrittura
  i18n/           config i18next, locales/{it,en,es}.json, lingue.ts
  theme/          tokens.ts (colori, tipografia, spaziature)
  types/          content.ts, db.ts
scripts/genera-contenuti/   scheletro Fase 5 (non implementato)
```

## Come si aggiunge un nuovo testo (per ora, manualmente)

Finché lo script di Fase 5 non è implementato:
1. Aggiungi le voci mancanti del dizionario a
   `src/data/content/dizionario.json` (controlla prima se il lemma esiste
   già — non duplicare).
2. Aggiungi le forme flesse nuove a `src/data/content/forme.json`.
3. Crea `src/data/content/opere/<slug>.json` seguendo lo schema `Opera` in
   `src/types/content.ts`.
4. Registra l'opera in `src/data/loadContent.ts` (array `OPERE`).

## Modifiche proposte dall'utente (registro)

Sezione per annotare, in ordine cronologico, le richieste di modifica che
l'utente farà da qui in avanti — così restano in memoria anche tra sessioni
diverse. Aggiungi una riga breve ad ogni richiesta importante, con la data.

- 2026-09-07 — Generazione iniziale dell'app (Fase 1+2) a partire dal
  documento di specifica, ricostruendo da zero in Expo/React Native al posto
  dell'app web precedente. Vedi le decisioni tecniche sopra.
- 2026-09-07 — "Continua con le cose che mancano": costruita la Fase 3
  (traduzione integrale + impostazioni con lingua e dimensione testo
  funzionanti). Tema scuro/seppia rimandato a Fase 6 per il motivo spiegato
  sopra. Trovato e corretto un bug reale (scrittura SQLite che bloccava un
  cambio lingua) — vedi decisione tecnica 9.
