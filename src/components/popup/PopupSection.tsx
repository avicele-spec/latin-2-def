import { StyleSheet, Text, View } from 'react-native';

import { TEMI, FONT, SPAZIATURA } from '../../theme/tokens';

const tema = TEMI.chiaro;

interface Props {
  etichetta: string;
  bozza?: boolean;
  children: React.ReactNode;
}

export default function PopupSection({ etichetta, bozza, children }: Props) {
  return (
    <View style={styles.sezione}>
      <View style={styles.etichettaRiga}>
        <Text style={styles.etichetta}>{etichetta}</Text>
        {bozza ? <View style={styles.puntinoBozza} /> : null}
      </View>
      {typeof children === 'string' ? <Text style={styles.contenutoTesto}>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  sezione: { marginBottom: SPAZIATURA.md },
  etichettaRiga: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  etichetta: {
    fontFamily: FONT.sansMedium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: tema.testoTenue,
  },
  puntinoBozza: { width: 5, height: 5, borderRadius: 3, backgroundColor: tema.bozza },
  contenutoTesto: { fontFamily: FONT.sans, fontSize: 15, lineHeight: 22, color: tema.testo },
});
