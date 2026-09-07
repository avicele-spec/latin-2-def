import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../navigation/types';
import { leggiOpera, testoConFallback } from '../data/loadContent';
import { leggiProgresso } from '../data/db/progresso';
import { useReadingStore } from '../store/useReadingStore';
import { useSettingsStore } from '../store/useSettingsStore';
import ParagraphLine from '../components/reading/ParagraphLine';
import { MisuraParola } from '../components/reading/WordToken';
import ParagraphNav from '../components/reading/ParagraphNav';
import WordPopupSheet, { WordPopupSheetRef, ALTEZZA_MASSIMA_POPUP } from '../components/popup/WordPopupSheet';
import { Occorrenza } from '../types/content';
import { TEMI, FONT, SCALA_TESTO, SPAZIATURA, RAGGIO } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Lettura'>;

const tema = TEMI.chiaro;
const ALTEZZA_FINESTRA = Dimensions.get('window').height;

export default function ReadingScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { operaSlug, libro, capitolo, paragrafo } = route.params;
  const insets = useSafeAreaInsets();
  const opera = useMemo(() => leggiOpera(operaSlug), [operaSlug]);
  const capitoloCorrente = useMemo(() => {
    const l = opera?.libri.find((b) => b.numero === libro);
    return l?.capitoli.find((c) => c.numero === capitolo);
  }, [opera, libro, capitolo]);
  const paragrafi = capitoloCorrente?.paragrafi ?? [];

  const [indice, setIndice] = useState(0);
  const [occorrenzaAttivaId, setOccorrenzaAttivaId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRif = useRef(0);
  const popupRif = useRef<WordPopupSheetRef>(null);

  const occorrenzeConsultate = useReadingStore((s) => s.occorrenzeConsultate);
  const segnaConsultata = useReadingStore((s) => s.segnaOccorrenzaConsultata);
  const salvaPosizione = useReadingStore((s) => s.salvaPosizioneCorrente);
  const dimensioneTesto = useSettingsStore((s) => s.dimensione_testo);
  const mostraParoleConsultate = useSettingsStore((s) => s.mostra_parole_consultate);
  const lingua = useSettingsStore((s) => s.lingua);
  const scala = SCALA_TESTO[dimensioneTesto];

  useEffect(() => {
    if (paragrafo) {
      setIndice(Math.max(0, paragrafo - 1));
      return;
    }
    leggiProgresso(operaSlug).then((p) => {
      if (p && p.libro === libro && p.capitolo === capitolo) {
        setIndice(Math.max(0, Math.min(p.paragrafo - 1, paragrafi.length - 1)));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operaSlug, libro, capitolo, paragrafo]);

  useEffect(() => {
    const paragrafoCorrente = paragrafi[indice];
    if (paragrafoCorrente) {
      salvaPosizione(operaSlug, { libro, capitolo, paragrafo: paragrafoCorrente.numero, indice_parola: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice]);

  const gestisciTocco = (occorrenza: Occorrenza, misura: MisuraParola) => {
    const cimaFoglio = ALTEZZA_FINESTRA - ALTEZZA_MASSIMA_POPUP;
    const margine = 28;
    const bordoInferioreParola = misura.pageY + misura.height;
    if (bordoInferioreParola > cimaFoglio - margine) {
      const delta = bordoInferioreParola - (cimaFoglio - margine);
      scrollRef.current?.scrollTo({ y: Math.max(0, scrollYRif.current + delta), animated: true });
    }
    setOccorrenzaAttivaId(occorrenza.occorrenza_id);
    segnaConsultata(occorrenza.occorrenza_id);
    popupRif.current?.mostra(occorrenza);
  };

  const vaiAlParagrafo = (nuovoIndice: number) => {
    setIndice(nuovoIndice);
    setOccorrenzaAttivaId(null);
    popupRif.current?.nascondi();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  if (!opera || !capitoloCorrente) return null;

  const paragrafoCorrente = paragrafi[indice];

  return (
    <View style={styles.contenitore}>
      <View style={[styles.intestazione, { paddingTop: insets.top + SPAZIATURA.sm }]}>
        <View style={styles.intestazioneRiga}>
          <Pressable onPress={() => navigation.goBack()} style={styles.pulsanteIndietro}>
            <Text style={styles.testoIndietro} numberOfLines={1}>
              ‹ {testoConFallback(opera.titolo, lingua)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              navigation.navigate('Traduzione', {
                operaSlug,
                libro,
                capitolo,
                paragrafoIniziale: paragrafoCorrente?.numero ?? 1,
              })
            }
            style={styles.pulsanteTraduzione}
          >
            <Text style={styles.testoTraduzione}>{t('lettura.traduzione_bottone')}</Text>
          </Pressable>
        </View>
        <Text style={styles.riferimento}>
          {t('lettura.riferimento', { libro, capitolo, paragrafo: paragrafoCorrente?.numero ?? '' })}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.corpo}
        contentContainerStyle={styles.corpoContenuto}
        onScroll={(e) => (scrollYRif.current = e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {paragrafoCorrente ? (
          <ParagraphLine
            paragrafo={paragrafoCorrente}
            occorrenzaAttivaId={occorrenzaAttivaId}
            occorrenzeConsultate={occorrenzeConsultate}
            mostraPuntino={mostraParoleConsultate}
            dimensioneCorpo={scala.corpo}
            interlinea={scala.interlinea}
            onTocco={gestisciTocco}
          />
        ) : null}
      </ScrollView>

      <ParagraphNav
        puoAndareIndietro={indice > 0}
        puoAndareAvanti={indice < paragrafi.length - 1}
        onIndietro={() => vaiAlParagrafo(Math.max(0, indice - 1))}
        onAvanti={() => vaiAlParagrafo(Math.min(paragrafi.length - 1, indice + 1))}
        etichettaPosizione={`${indice + 1} / ${paragrafi.length}`}
      />

      <WordPopupSheet ref={popupRif} onDismiss={() => setOccorrenzaAttivaId(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenitore: { flex: 1, backgroundColor: tema.sfondo },
  intestazione: {
    paddingHorizontal: SPAZIATURA.lg,
    paddingBottom: SPAZIATURA.sm,
    borderBottomWidth: 1,
    borderBottomColor: tema.bordo,
    backgroundColor: tema.sfondo,
  },
  intestazioneRiga: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  pulsanteIndietro: { flexShrink: 1, marginRight: SPAZIATURA.sm },
  testoIndietro: { fontFamily: FONT.sans, fontSize: 14, color: tema.accento },
  pulsanteTraduzione: {
    paddingVertical: 4,
    paddingHorizontal: SPAZIATURA.sm,
    borderRadius: RAGGIO.pillola,
    borderWidth: 1,
    borderColor: tema.bordo,
  },
  testoTraduzione: { fontFamily: FONT.sansMedium, fontSize: 12, color: tema.testoTenue },
  riferimento: { fontFamily: FONT.sansMedium, fontSize: 12, color: tema.testoTenue, letterSpacing: 0.4 },
  corpo: { flex: 1 },
  corpoContenuto: { paddingHorizontal: SPAZIATURA.lg, paddingVertical: SPAZIATURA.lg, paddingBottom: SPAZIATURA.xxl },
});
