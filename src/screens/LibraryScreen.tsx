import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../navigation/types';
import { elencoOpere } from '../data/loadContent';
import { leggiProgresso } from '../data/db/progresso';
import { ProgressoLettura } from '../types/db';
import { testoConFallback } from '../data/loadContent';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTema } from '../theme/useTema';
import { Tema, FONT, SPAZIATURA, RAGGIO } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Libreria'>;

export default function LibraryScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const lingua = useSettingsStore((s) => s.lingua) || i18n.language;
  const tema = useTema();
  const styles = useMemo(() => creaStili(tema), [tema]);
  const opere = elencoOpere();
  const [progressi, setProgressi] = useState<Record<string, ProgressoLettura | null>>({});

  useFocusEffect(
    useCallback(() => {
      let annullato = false;
      Promise.all(opere.map((o) => leggiProgresso(o.slug))).then((risultati) => {
        if (annullato) return;
        const mappa: Record<string, ProgressoLettura | null> = {};
        opere.forEach((o, i) => (mappa[o.slug] = risultati[i]));
        setProgressi(mappa);
      });
      return () => {
        annullato = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <View style={styles.contenitore}>
      <Text style={styles.sottotitolo}>{t('libreria.sottotitolo')}</Text>
      <FlatList
        data={opere}
        keyExtractor={(o) => o.slug}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => {
          const progresso = progressi[item.slug];
          return (
            <Pressable
              style={({ pressed }) => [styles.carta, pressed && styles.cartaPremuta]}
              onPress={() => navigation.navigate('Capitoli', { operaSlug: item.slug })}
              accessibilityRole="button"
              accessibilityLabel={`${testoConFallback(item.titolo, lingua)}, ${testoConFallback(item.autore, lingua)}`}
            >
              <View style={styles.cartaTesto}>
                <Text style={styles.titoloOpera}>{testoConFallback(item.titolo, lingua)}</Text>
                <Text style={styles.autoreOpera}>{testoConFallback(item.autore, lingua)}</Text>
                <Text style={styles.metaOpera}>
                  {t(item.numero_capitoli === 1 ? 'libreria.capitoli_uno' : 'libreria.capitoli_altri', {
                    count: item.numero_capitoli,
                  })}
                </Text>
              </View>
              <Text style={styles.azione}>{progresso ? t('libreria.continua') : t('libreria.inizia')} ›</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

function creaStili(tema: Tema) {
  return StyleSheet.create({
    contenitore: { flex: 1, backgroundColor: tema.sfondo, paddingTop: SPAZIATURA.sm },
    sottotitolo: {
      fontFamily: FONT.sans,
      fontSize: 14,
      color: tema.testoTenue,
      paddingHorizontal: SPAZIATURA.lg,
      marginBottom: SPAZIATURA.md,
    },
    lista: { paddingHorizontal: SPAZIATURA.lg, paddingBottom: SPAZIATURA.xxl, gap: SPAZIATURA.md },
    carta: {
      backgroundColor: tema.carta,
      borderRadius: RAGGIO.lg,
      borderWidth: 1,
      borderColor: tema.bordo,
      padding: SPAZIATURA.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: tema.ombra,
      shadowOpacity: 1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    cartaPremuta: { opacity: 0.85 },
    cartaTesto: { flex: 1, paddingRight: SPAZIATURA.md },
    titoloOpera: { fontFamily: FONT.serifSemiBold, fontSize: 19, color: tema.testo, marginBottom: 2 },
    autoreOpera: { fontFamily: FONT.serif, fontSize: 15, color: tema.testoTenue, fontStyle: 'italic' },
    metaOpera: { fontFamily: FONT.sans, fontSize: 12, color: tema.testoTenue, marginTop: SPAZIATURA.sm },
    azione: { fontFamily: FONT.sansMedium, fontSize: 13, color: tema.accento },
  });
}
