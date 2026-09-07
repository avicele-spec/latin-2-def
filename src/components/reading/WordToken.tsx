import { useRef } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Occorrenza } from '../../types/content';
import { TEMI, FONT } from '../../theme/tokens';

const tema = TEMI.chiaro;

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
      style={[styles.parola, { fontSize: dimensioneCorpo }, attiva && styles.parolaAttiva]}
    >
      {formaTesto}
      {mostraPuntino && consultata ? <Text style={styles.puntino}> ·</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  parola: { fontFamily: FONT.serif, color: tema.testo },
  parolaAttiva: { backgroundColor: 'rgba(122,59,46,0.16)', borderRadius: 3 },
  puntino: { color: tema.bozza, fontSize: 11 },
});
