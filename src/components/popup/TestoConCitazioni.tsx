import { Text, TextStyle } from 'react-native';

import { FONT } from '../../theme/tokens';

interface Props {
  testo: string;
  style?: TextStyle;
}

/**
 * Mette in corsivo le citazioni tra apici dritti singoli ('gallico') in un
 * testo di etimologia o di note sui discendenti — le elisioni italiane/
 * spagnole nel contenuto usano l'apostrofo tipografico ’, mai l'apice
 * dritto, proprio per non rompere questo accoppiamento (vedi CLAUDE.md).
 * Un numero dispari di apici (contenuto non ancora a norma) lascia
 * semplicemente l'ultimo pezzo senza corsivo, senza rompere il render.
 */
export default function TestoConCitazioni({ testo, style }: Props) {
  const parti = testo.split("'");
  return (
    <Text style={style}>
      {parti.map((parte, indice) =>
        indice % 2 === 1 ? (
          <Text key={indice} style={styleCitazione}>
            {parte}
          </Text>
        ) : (
          parte
        )
      )}
    </Text>
  );
}

const styleCitazione: TextStyle = { fontFamily: FONT.serif, fontStyle: 'italic' };
