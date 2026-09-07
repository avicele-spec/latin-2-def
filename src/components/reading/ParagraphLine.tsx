import { StyleSheet, Text } from 'react-native';

import { Paragrafo, Occorrenza } from '../../types/content';
import WordToken, { MisuraParola } from './WordToken';
import { useTema } from '../../theme/useTema';
import { FONT } from '../../theme/tokens';
import { leggiForma } from '../../data/loadContent';

interface Props {
  paragrafo: Paragrafo;
  occorrenzaAttivaId: string | null;
  occorrenzeConsultate: Set<string>;
  mostraPuntino: boolean;
  dimensioneCorpo: number;
  interlinea: number;
  onTocco: (occorrenza: Occorrenza, misura: MisuraParola) => void;
}

export default function ParagraphLine({
  paragrafo,
  occorrenzaAttivaId,
  occorrenzeConsultate,
  mostraPuntino,
  dimensioneCorpo,
  interlinea,
  onTocco,
}: Props) {
  const tema = useTema();

  return (
    <Text style={[styles.paragrafo, { lineHeight: interlinea }]}>
      {paragrafo.testo.map((elemento, indice) => {
        if (elemento.tipo === 'separatore') {
          return (
            <Text
              key={`sep_${indice}`}
              style={{ fontFamily: FONT.serif, fontSize: dimensioneCorpo, color: tema.testo }}
            >
              {elemento.testo}
            </Text>
          );
        }
        const forma = leggiForma(elemento.forma_id);
        return (
          <WordToken
            key={elemento.occorrenza_id}
            occorrenza={elemento}
            formaTesto={forma?.forma ?? ''}
            attiva={elemento.occorrenza_id === occorrenzaAttivaId}
            consultata={occorrenzeConsultate.has(elemento.occorrenza_id)}
            mostraPuntino={mostraPuntino}
            dimensioneCorpo={dimensioneCorpo}
            onPress={onTocco}
          />
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  paragrafo: { marginBottom: 4 },
});
