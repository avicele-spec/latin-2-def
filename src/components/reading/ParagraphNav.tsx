import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTema } from '../../theme/useTema';
import { Tema, FONT, SPAZIATURA, RAGGIO } from '../../theme/tokens';

interface Props {
  puoAndareIndietro: boolean;
  puoAndareAvanti: boolean;
  onIndietro: () => void;
  onAvanti: () => void;
  etichettaPosizione: string;
}

export default function ParagraphNav({
  puoAndareIndietro,
  puoAndareAvanti,
  onIndietro,
  onAvanti,
  etichettaPosizione,
}: Props) {
  const { t } = useTranslation();
  const tema = useTema();
  const styles = useMemo(() => creaStili(tema), [tema]);

  return (
    <View style={styles.barra}>
      <Pressable
        disabled={!puoAndareIndietro}
        onPress={onIndietro}
        accessibilityLabel={t('lettura.paragrafo_precedente')}
        style={({ pressed }) => [
          styles.pulsante,
          !puoAndareIndietro && styles.pulsanteDisabilitato,
          pressed && styles.pulsantePremuto,
        ]}
      >
        <Text style={[styles.freccia, !puoAndareIndietro && styles.frecciaDisabilitata]}>‹</Text>
      </Pressable>
      <Text style={styles.posizione}>{etichettaPosizione}</Text>
      <Pressable
        disabled={!puoAndareAvanti}
        onPress={onAvanti}
        accessibilityLabel={t('lettura.paragrafo_successivo')}
        style={({ pressed }) => [
          styles.pulsante,
          !puoAndareAvanti && styles.pulsanteDisabilitato,
          pressed && styles.pulsantePremuto,
        ]}
      >
        <Text style={[styles.freccia, !puoAndareAvanti && styles.frecciaDisabilitata]}>›</Text>
      </Pressable>
    </View>
  );
}

function creaStili(tema: Tema) {
  return StyleSheet.create({
    barra: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPAZIATURA.lg,
      paddingVertical: SPAZIATURA.sm,
      borderTopWidth: 1,
      borderTopColor: tema.bordo,
      backgroundColor: tema.sfondo,
    },
    pulsante: {
      width: 40,
      height: 40,
      borderRadius: RAGGIO.pillola,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tema.carta,
      borderWidth: 1,
      borderColor: tema.bordo,
    },
    pulsanteDisabilitato: { opacity: 0.35 },
    pulsantePremuto: { opacity: 0.7 },
    freccia: { fontSize: 20, color: tema.accento, fontFamily: FONT.serifSemiBold },
    frecciaDisabilitata: { color: tema.testoTenue },
    posizione: { fontFamily: FONT.sans, fontSize: 12, color: tema.testoTenue, letterSpacing: 0.3 },
  });
}
