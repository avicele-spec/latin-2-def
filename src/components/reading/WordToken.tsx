import { useMemo, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Occorrenza } from '../../types/content';
import { useTema } from '../../theme/useTema';
import { Tema, FONT, conAlpha } from '../../theme/tokens';

export interface MisuraParola {
  pageY: number;
  height: number;
}

interface Props {
  occorrenza: Occorrenza;
  formaTesto: string;
  attiva: boolean;
  consultata: boolean;
  mostraPuntino: boolean;
  dimensioneCorpo: number;
  onPress: (occorrenza: Occorrenza, misura: MisuraParola) => void;
}

export default function WordToken({
  occorrenza,
  formaTesto,
  attiva,
  consultata,
  mostraPuntino,
  dimensioneCorpo,
  onPress,
}: Props) {
  const { t } = useTranslation();
  const tema = useTema();
  const styles = useMemo(() => creaStili(tema), [tema]);
  const rifInterno = useRef<Text>(null);

  const alTocco = () => {
    rifInterno.current?.measure((_x, _y, _width, height, _pageX, pageY) => {
      onPress(occorrenza, { pageY, height });
    });
  };

  return (
    <Text
      ref={rifInterno}
      suppressHighlighting
      onPress={alTocco}
      accessibilityRole="button"
      accessibilityLabel={formaTesto}
      accessibilityHint={t('lettura.parola_suggerimento')}
      style={[styles.parola, { fontSize: dimensioneCorpo }, attiva && styles.parolaAttiva]}
    >
      {formaTesto}
      {mostraPuntino && consultata ? <Text style={styles.puntino}> ·</Text> : null}
    </Text>
  );
}

function creaStili(tema: Tema) {
  return StyleSheet.create({
    parola: { fontFamily: FONT.serif, color: tema.testo },
    parolaAttiva: { backgroundColor: conAlpha(tema.accento, 0.18), borderRadius: 3 },
    puntino: { color: tema.bozza, fontSize: 11 },
  });
}
