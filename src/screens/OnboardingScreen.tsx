import { useMemo, useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useTema } from '../theme/useTema';
import { Tema, FONT, SPAZIATURA, RAGGIO } from '../theme/tokens';

interface Props {
  onFine: () => void;
}

const LARGHEZZA_FINESTRA = Dimensions.get('window').width;

export default function OnboardingScreen({ onFine }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tema = useTema();
  const styles = useMemo(() => creaStili(tema), [tema]);
  const scrollRef = useRef<ScrollView>(null);
  const [pagina, setPagina] = useState(0);

  const pagine = [
    { titolo: t('onboarding.titolo1'), testo: t('onboarding.testo1'), illustrazione: <IllustrazioneTocco tema={tema} /> },
    { titolo: t('onboarding.titolo2'), testo: t('onboarding.testo2'), illustrazione: <IllustrazioneTraduzione tema={tema} /> },
    { titolo: t('onboarding.titolo3'), testo: t('onboarding.testo3'), illustrazione: <IllustrazioneLingua tema={tema} /> },
  ];

  const alloScorrimento = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const indice = Math.round(e.nativeEvent.contentOffset.x / LARGHEZZA_FINESTRA);
    setPagina(indice);
  };

  const vaiAvanti = () => {
    if (pagina < pagine.length - 1) {
      const prossima = pagina + 1;
      // Aggiorna subito lo stato invece di aspettare onMomentumScrollEnd:
      // sul target web di verifica lo scrollTo programmatico non genera
      // sempre l'evento di fine momentum, lasciando i puntini indietro.
      setPagina(prossima);
      scrollRef.current?.scrollTo({ x: prossima * LARGHEZZA_FINESTRA, animated: true });
    } else {
      onFine();
    }
  };

  return (
    <View style={[styles.contenitore, { paddingTop: insets.top, paddingBottom: insets.bottom + SPAZIATURA.lg }]}>
      <Pressable
        onPress={onFine}
        style={styles.pulsanteSalta}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.salta')}
      >
        <Text style={styles.pulsanteSaltaTesto}>{t('onboarding.salta')}</Text>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={alloScorrimento}
      >
        {pagine.map((p, indice) => (
          <View key={indice} style={[styles.pagina, { width: LARGHEZZA_FINESTRA }]}>
            <View style={styles.illustrazione} importantForAccessibility="no-hide-descendants">
              {p.illustrazione}
            </View>
            <Text style={styles.titolo}>{p.titolo}</Text>
            <Text style={styles.testo}>{p.testo}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.piePagina}>
        <View style={styles.puntini} importantForAccessibility="no-hide-descendants">
          {pagine.map((_, indice) => (
            <View key={indice} style={[styles.puntino, indice === pagina && styles.puntinoAttivo]} />
          ))}
        </View>
        <Pressable
          onPress={vaiAvanti}
          accessibilityRole="button"
          accessibilityLabel={pagina === pagine.length - 1 ? t('onboarding.inizia') : t('onboarding.avanti')}
          style={styles.pulsanteAvanti}
        >
          <Text style={styles.pulsanteAvantiTesto}>
            {pagina === pagine.length - 1 ? t('onboarding.inizia') : t('onboarding.avanti')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function IllustrazioneTocco({ tema }: { tema: Tema }) {
  const styles = creaStili(tema);
  return (
    <View style={styles.mockRiga}>
      <Text style={styles.mockParola}>Maior</Text>
      <View style={styles.mockParolaEvidenziata}>
        <Text style={[styles.mockParola, { color: tema.accentoTestoSu }]}>pars</Text>
      </View>
      <Text style={styles.mockParola}>mortalium</Text>
    </View>
  );
}

function IllustrazioneTraduzione({ tema }: { tema: Tema }) {
  const styles = creaStili(tema);
  return (
    <View style={styles.mockCarta}>
      <View style={[styles.mockLinea, { width: '70%' }]} />
      <View style={[styles.mockLinea, { width: '55%' }]} />
      <View style={[styles.mockLinea, styles.mockLineaTraduzione, { width: '80%' }]} />
      <View style={[styles.mockLinea, styles.mockLineaTraduzione, { width: '60%' }]} />
    </View>
  );
}

function IllustrazioneLingua({ tema }: { tema: Tema }) {
  const styles = creaStili(tema);
  return (
    <View style={styles.mockLingueRiga}>
      {['IT', 'EN', 'ES'].map((codice, indice) => (
        <View key={codice} style={[styles.mockLinguaPillola, indice === 0 && styles.mockLinguaPillolaAttiva]}>
          <Text style={[styles.mockLinguaTesto, indice === 0 && { color: tema.accentoTestoSu }]}>{codice}</Text>
        </View>
      ))}
    </View>
  );
}

function creaStili(tema: Tema) {
  return StyleSheet.create({
    contenitore: { flex: 1, backgroundColor: tema.sfondo },
    pulsanteSalta: { alignSelf: 'flex-end', paddingHorizontal: SPAZIATURA.lg, paddingVertical: SPAZIATURA.sm },
    pulsanteSaltaTesto: { fontFamily: FONT.sans, fontSize: 14, color: tema.testoTenue },
    pagina: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPAZIATURA.xl },
    illustrazione: { marginBottom: SPAZIATURA.xl, alignItems: 'center', justifyContent: 'center', minHeight: 90 },
    titolo: {
      fontFamily: FONT.serifSemiBold,
      fontSize: 26,
      color: tema.testo,
      textAlign: 'center',
      marginBottom: SPAZIATURA.md,
    },
    testo: { fontFamily: FONT.sans, fontSize: 15, lineHeight: 23, color: tema.testoTenue, textAlign: 'center' },
    piePagina: { paddingHorizontal: SPAZIATURA.xl, gap: SPAZIATURA.lg },
    puntini: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
    puntino: { width: 7, height: 7, borderRadius: 4, backgroundColor: tema.bordo },
    puntinoAttivo: { backgroundColor: tema.accento, width: 20 },
    pulsanteAvanti: {
      backgroundColor: tema.accento,
      borderRadius: RAGGIO.pillola,
      paddingVertical: 14,
      alignItems: 'center',
    },
    pulsanteAvantiTesto: { fontFamily: FONT.sansMedium, fontSize: 15, color: tema.accentoTestoSu },
    // Mock illustrazione 1 — tocco parola
    mockRiga: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    mockParola: { fontFamily: FONT.serif, fontSize: 20, color: tema.testo },
    mockParolaEvidenziata: {
      backgroundColor: tema.accento,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    // Mock illustrazione 2 — traduzione
    mockCarta: {
      width: 220,
      backgroundColor: tema.carta,
      borderRadius: RAGGIO.md,
      borderWidth: 1,
      borderColor: tema.bordo,
      padding: SPAZIATURA.md,
      gap: 8,
    },
    mockLinea: { height: 6, borderRadius: 3, backgroundColor: tema.bordo },
    mockLineaTraduzione: { backgroundColor: tema.accento, opacity: 0.5, marginTop: 6 },
    // Mock illustrazione 3 — lingua
    mockLingueRiga: { flexDirection: 'row', gap: 10 },
    mockLinguaPillola: {
      borderWidth: 1,
      borderColor: tema.bordo,
      borderRadius: RAGGIO.pillola,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: tema.carta,
    },
    mockLinguaPillolaAttiva: { backgroundColor: tema.accento, borderColor: tema.accento },
    mockLinguaTesto: { fontFamily: FONT.sansMedium, fontSize: 13, color: tema.testoTenue },
  });
}
