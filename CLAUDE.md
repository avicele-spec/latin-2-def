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
- **Fase 4** (personalizzazioni). Nel popup, icona "Modifica" (Fine/×
  quando attiva) rende editabili in linea traduzione contestuale, nota
  sintattica, etimologia e — da Fase 6e — anche i discendenti/cognati
  (elenco separato da virgole + nota separata) tramite `CampoModificabile`,
  ciascun campo con salvataggio e ripristino indipendenti e un punto
  discreto quando il valore mostrato è un override. Gli override su lemma
  (etimologia, discendenti) si applicano a tutte le occorrenze; quelli su
  occorrenza (traduzione, nota sintattica) solo a quel punto — la
  `CustomizationsScreen` (da Impostazioni → Personalizzazioni) lo mostra
  esplicitamente per ogni riga, con esportazione/importazione JSON
  (`expo-file-system` + `expo-sharing`). **Non incluso**: override sulle
  forme (paradigma/analisi morfologica) — il documento li prevede ma non
  sono ancora modificabili da UI, restano per una fase futura.
- **Fase 6** (rifinitura). Tema reattivo (`useTema()` al posto di
  `TEMI.chiaro` importato come costante — tutte le schermate e i
  componenti, ~13 file) con selettore chiaro/scuro/seppia funzionante in
  `SettingsScreen`, verificato nei tre temi su ogni schermata inclusa la
  status bar. Auto-corsivo delle citazioni tra apici (`TestoConCitazioni`)
  applicato a etimologia e nota dei discendenti. Onboarding di 3 schermate
  al primo avvio (tocco parola, traduzione integrale, scelta lingua),
  saltabile, con flag di completamento persistito in SQLite. Passata di
  accessibilità: `accessibilityRole`/`accessibilityLabel`/
  `accessibilityState` sui controlli interattivi (parole tappabili, card
  libreria/capitoli, pulsanti del popup e delle impostazioni, selettori a
  pillole trattati come `radio`), illustrazioni puramente decorative
  escluse dallo screen reader. Editor dei discendenti (vedi Fase 4 sopra).
  **Non fatto**: icona/splash artwork dedicati (restano il placeholder di
  Expo, solo i colori sono personalizzati — nessuno strumento di
  illustrazione disponibile in questa sessione); prestazioni su capitoli
  lunghi (il corpus attuale, 5 paragrafi, non permette di misurare nulla
  di significativo — da rivedere quando il corpus crescerà, Fase 5); i
  tocchi sulle singole parole restano piccoli per natura — `Text` di React
  Native non supporta `hitSlop`, quindi ingrandire l'area di tocco
  richiederebbe di avvolgere ogni parola in un `Pressable`/`View` invece
  del `Text` annidato attuale, un cambiamento più invasivo rimandato.

Non ancora costruito:
- **Fase 5** — script di generazione reale: `scripts/genera-contenuti/`
  contiene solo lo scheletro (CLI, controllo incrementale, modalità
  aggiungi-lingua, batch/ripresa), tutto stubbato. Per renderlo funzionante
  serve una decisione dell'utente su quale provider/modello usare e come
  gestire la chiave API — non è stata ancora presa.

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
6. **Tema**: tutti e tre i temi (chiaro/scuro/seppia, `src/theme/tokens.ts`)
   sono collegati e selezionabili da Impostazioni, tramite l'hook
   `useTema()` (`src/theme/useTema.ts`) che ogni schermata/componente
   chiama per ottenere il tema corrente invece di importare una costante.
   Gli stili che dipendono dal tema sono funzioni `creaStili(tema)`
   richiamate con `useMemo` dentro al componente, non più
   `StyleSheet.create` a livello di modulo.
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
10. **Avanzamento pagina nell'onboarding: stato ottimistico, non l'evento
    di scroll.** `OnboardingScreen` avanza pagina sia con lo swipe sia con
    il pulsante "Avanti". Il pulsante aggiornava `pagina` solo tramite
    `onMomentumScrollEnd` dopo lo `scrollTo` programmatico — sul target
    web di verifica quell'evento non sempre parte, lasciando i puntini
    (e il calcolo della pagina successiva) indietro di un tocco. Ora il
    pulsante aggiorna `pagina` subito e poi chiama `scrollTo`;
    `onMomentumScrollEnd` resta solo per sincronizzare lo swipe manuale.
11. **`Text` di React Native non supporta `hitSlop`.** Le parole tappabili
    (`WordToken`) restano quindi piccole quanto il testo stesso — non è
    stato possibile allargarne l'area di tocco con `hitSlop` come per i
    `Pressable`. Se in futuro serve un'area di tocco più grande, l'unica
    strada è avvolgere ogni parola in un `Pressable`/`View` invece del
    `Text` annidato attuale (cambia il modo in cui il testo va a capo,
    va verificato con attenzione).

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
  perché `TestoConCitazioni` (`src/components/popup/TestoConCitazioni.tsx`)
  li mette in corsivo automaticamente individuando le coppie di apici. Le
  elisioni italiane/spagnole (`l'aggettivo`, `un'idea`) vanno scritte con
  l'apostrofo tipografico `'` (U+2019), mai con l'apice dritto, altrimenti
  spezzano l'accoppiamento delle citazioni.

## Struttura cartelle

```
src/
  navigation/     RootNavigator (native-stack) + tipi delle route
  screens/        LibraryScreen, ChaptersScreen, ReadingScreen,
                  TranslationScreen, SettingsScreen, CustomizationsScreen,
                  OnboardingScreen
  components/
    reading/      WordToken, ParagraphLine, ParagraphNav
    popup/        WordPopupSheet (bottom sheet), PopupSection,
                  CampoModificabile (campo editabile con override),
                  TestoConCitazioni (auto-corsivo delle citazioni)
  store/          useSettingsStore, useReadingStore (zustand)
  data/
    content/      JSON statici (dizionario, forme, opere/*)
    loadContent.ts
    db/           schema SQLite + helper di lettura/scrittura
  i18n/           config i18next, locales/{it,en,es}.json, lingue.ts
  theme/          tokens.ts (colori, tipografia, spaziature, conAlpha),
                  useTema.ts (hook per il tema attivo)
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
  cambio lingua) — vedi decisione tecnica 9. Proseguito poi con la Fase 4
  (editor delle personalizzazioni nel popup + CustomizationsScreen con
  esporta/importa), scope volutamente ridotto ai campi di testo semplice
  (traduzione, nota, etimologia) — discendenti e forme restano per Fase 6.
  Scelto di continuare con la sola Fase 6 (non la 5, che richiede una
  decisione dell'utente su provider/chiave API del modello linguistico):
  tema reattivo con selettore chiaro/scuro/seppia, auto-corsivo delle
  citazioni, onboarding di 3 schermate, passata di accessibilità, ed
  editor dei discendenti (completando così anche lo scope lasciato aperto
  in Fase 4). Icona/splash artwork dedicati non fatti (nessuno strumento
  di illustrazione disponibile in sessione). Trovati e corretti altri due
  bug reali in verifica: i puntini dell'onboarding restavano indietro di
  un tocco sul pulsante "Avanti" (vedi decisione tecnica 10), e l'header
  della Libreria tagliava il testo del pulsante Impostazioni sul bordo
  destro dello schermo.
