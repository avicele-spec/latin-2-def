import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../navigation/types';
import { leggiForma, leggiOpera, testoConFallback } from '../data/loadContent';
import { useSettingsStore } from '../store/useSettingsStore';
import { ElementoTesto, Paragrafo } from '../types/content';
import { useTema } from '../theme/useTema';
import { Tema, FONT, SPAZIATURA, RAGGIO } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Traduzione'>;

type Modalita = 'fronte' | 'sola';

function testoLatinoPiano(paragrafo: Paragrafo): string {
  return paragrafo.testo
    .map((elemento: ElementoTesto) =>
      elemento.tipo === 'separatore' ? elemento.testo : (leggiForma(elemento.forma_id)?.forma ?? '')
    )
    .join('');
}

export default function TranslationScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { operaSlug, libro, capitolo, paragrafoIniziale } = route.params;
  const lingua = useSettingsStore((s) => s.lingua);
  const tema = useTema();
  const styles = useMemo(() => creaStili(tema), [tema]);
  const [modalita, setModalita] = useState<Modalita>('fronte');
  const scrollRef = useRef<ScrollView>(null);
  const posizioniY = useRef<Map<number, number>>(new Map());
  const [pronta, setPronta] = useState(false);

  const opera = useMemo(() => leggiOpera(operaSlug), [operaSlug]);
  const capitoloCorrente = useMemo(() => {
    const l = opera?.libri.find((b) => b.numero === libro);
    return l?.capitoli.find((c) => c.numero === capitolo);
  }, [opera, libro, capitolo]);
  const paragrafi = capitoloCorrente?.paragrafi ?? [];

  useEffect(() => {
    if (!pronta) return;
    const y = posizioniY.current.get(paragrafoIniziale);
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - SPAZIATURA.lg), animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronta]);

  const tornaAlParagrafo = (numeroParagrafo: number) => {
    navigation.navigate('Lettura', { operaSlug, libro, capitolo, paragrafo: numeroParagrafo });
  };

  if (!opera || !capitoloCorrente) return null;

  return (
    <View style={styles.contenitore}>
      <View style={styles.selettore}>
        <Pressable
          onPress={() => setModalita('fronte')}
          accessibilityRole="radio"
          accessibilityState={{ selected: modalita === 'fronte' }}
          accessibilityLabel={t('traduzione.a_fronte')}
          style={[styles.opzione, modalita === 'fronte' && styles.opzioneAttiva]}
        >
          <Text style={[styles.opzioneTesto, modalita === 'fronte' && styles.opzioneTestoAttivo]}>
            {t('traduzione.a_fronte')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setModalita('sola')}
          accessibilityRole="radio"
          accessibilityState={{ selected: modalita === 'sola' }}
          accessibilityLabel={t('traduzione.solo_traduzione')}
          style={[styles.opzione, modalita === 'sola' && styles.opzioneAttiva]}
        >
          <Text style={[styles.opzioneTesto, modalita === 'sola' && styles.opzioneTestoAttivo]}>
            {t('traduzione.solo_traduzione')}
          </Text>
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.corpo}>
        {paragrafi.map((paragrafo) => (
          <Pressable
            key={paragrafo.numero}
            onLayout={(e) => {
              posizioniY.current.set(paragrafo.numero, e.nativeEvent.layout.y);
              if (paragrafo.numero === paragrafi[paragrafi.length - 1].numero) setPronta(true);
            }}
            onPress={() => tornaAlParagrafo(paragrafo.numero)}
            accessibilityRole="button"
            accessibilityLabel={t('traduzione.paragrafo', { numero: paragrafo.numero })}
            style={({ pressed }) => [styles.blocco, pressed && styles.bloccoPremuto]}
          >
            <Text style={styles.numeroParagrafo}>{t('traduzione.paragrafo', { numero: paragrafo.numero })}</Text>
            {modalita === 'fronte' ? <Text style={styles.testoLatino}>{testoLatinoPiano(paragrafo)}</Text> : null}
            <Text style={styles.testoTraduzione}>{testoConFallback(paragrafo.traduzione_integrale, lingua)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function creaStili(tema: Tema) {
  return StyleSheet.create({
    contenitore: { flex: 1, backgroundColor: tema.sfondo },
    selettore: {
      flexDirection: 'row',
      gap: SPAZIATURA.sm,
      paddingHorizontal: SPAZIATURA.lg,
      paddingVertical: SPAZIATURA.md,
      borderBottomWidth: 1,
      borderBottomColor: tema.bordo,
    },
    opzione: {
      paddingVertical: 6,
      paddingHorizontal: SPAZIATURA.md,
      borderRadius: RAGGIO.pillola,
      borderWidth: 1,
      borderColor: tema.bordo,
      backgroundColor: tema.carta,
    },
    opzioneAttiva: { backgroundColor: tema.accento, borderColor: tema.accento },
    opzioneTesto: { fontFamily: FONT.sansMedium, fontSize: 13, color: tema.testoTenue },
    opzioneTestoAttivo: { color: tema.accentoTestoSu },
    corpo: { padding: SPAZIATURA.lg, gap: SPAZIATURA.md, paddingBottom: SPAZIATURA.xxl },
    blocco: {
      backgroundColor: tema.carta,
      borderRadius: RAGGIO.md,
      borderWidth: 1,
      borderColor: tema.bordo,
      padding: SPAZIATURA.md,
    },
    bloccoPremuto: { opacity: 0.85 },
    numeroParagrafo: {
      fontFamily: FONT.sansMedium,
      fontSize: 11,
      color: tema.testoTenue,
      marginBottom: SPAZIATURA.sm,
    },
    testoLatino: {
      fontFamily: FONT.serif,
      fontStyle: 'italic',
      fontSize: 15,
      lineHeight: 24,
      color: tema.testoTenue,
      marginBottom: SPAZIATURA.sm,
    },
    testoTraduzione: { fontFamily: FONT.serif, fontSize: 17, lineHeight: 27, color: tema.testo },
  });
}
