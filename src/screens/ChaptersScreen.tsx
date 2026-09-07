import { useLayoutEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../navigation/types';
import { leggiOpera, testoConFallback } from '../data/loadContent';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTema } from '../theme/useTema';
import { Tema, FONT, SPAZIATURA, RAGGIO } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Capitoli'>;

export default function ChaptersScreen({ route, navigation }: Props) {
  const { t, i18n } = useTranslation();
  const lingua = useSettingsStore((s) => s.lingua) || i18n.language;
  const tema = useTema();
  const styles = useMemo(() => creaStili(tema), [tema]);
  const opera = leggiOpera(route.params.operaSlug);

  useLayoutEffect(() => {
    if (opera) navigation.setOptions({ title: testoConFallback(opera.titolo, lingua) });
  }, [navigation, opera, lingua]);

  if (!opera) return null;

  const capitoli = opera.libri.flatMap((libro) =>
    libro.capitoli.map((capitolo) => ({
      libro: libro.numero,
      capitolo: capitolo.numero,
      numeroParagrafi: capitolo.paragrafi.length,
    }))
  );

  return (
    <View style={styles.contenitore}>
      <View style={styles.intestazione}>
        <Text style={styles.titolo}>{testoConFallback(opera.titolo, lingua)}</Text>
        <Text style={styles.autore}>{testoConFallback(opera.autore, lingua)}</Text>
      </View>
      <FlatList
        data={capitoli}
        keyExtractor={(c) => `${c.libro}-${c.capitolo}`}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.riga, pressed && styles.rigaPremuta]}
            onPress={() =>
              navigation.navigate('Lettura', {
                operaSlug: opera.slug,
                libro: item.libro,
                capitolo: item.capitolo,
              })
            }
            accessibilityRole="button"
            accessibilityLabel={t('capitoli.capitolo', { numero: item.capitolo })}
          >
            <Text style={styles.capitoloTesto}>{t('capitoli.capitolo', { numero: item.capitolo })}</Text>
            <Text style={styles.capitoloMeta}>
              {t(item.numeroParagrafi === 1 ? 'capitoli.paragrafi_uno' : 'capitoli.paragrafi_altri', {
                count: item.numeroParagrafi,
              })}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

function creaStili(tema: Tema) {
  return StyleSheet.create({
    contenitore: { flex: 1, backgroundColor: tema.sfondo },
    intestazione: { paddingHorizontal: SPAZIATURA.lg, paddingTop: SPAZIATURA.sm, paddingBottom: SPAZIATURA.lg },
    titolo: { fontFamily: FONT.serifSemiBold, fontSize: 24, color: tema.testo, marginBottom: 4 },
    autore: { fontFamily: FONT.serif, fontSize: 16, color: tema.testoTenue, fontStyle: 'italic' },
    lista: { paddingHorizontal: SPAZIATURA.lg, paddingBottom: SPAZIATURA.xxl, gap: SPAZIATURA.sm },
    riga: {
      backgroundColor: tema.carta,
      borderRadius: RAGGIO.md,
      borderWidth: 1,
      borderColor: tema.bordo,
      padding: SPAZIATURA.md,
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    rigaPremuta: { opacity: 0.85 },
    capitoloTesto: { fontFamily: FONT.serifSemiBold, fontSize: 17, color: tema.testo },
    capitoloMeta: { fontFamily: FONT.sans, fontSize: 12, color: tema.testoTenue },
  });
}
