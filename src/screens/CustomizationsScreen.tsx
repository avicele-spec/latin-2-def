import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { elencaOverrides, ripristinaOriginale, salvaOverride } from '../data/db/overrides';
import { leggiLemma, leggiOccorrenza, leggiForma } from '../data/loadContent';
import { Override } from '../types/db';
import { useTema } from '../theme/useTema';
import { Tema, FONT, SPAZIATURA, RAGGIO } from '../theme/tokens';

const FILE_ESPORTAZIONE = 'personalizzazioni-lector.json';

function etichettaTarget(o: Override): string {
  if (o.target_tipo === 'lemma') {
    const lemma = leggiLemma(o.target_id);
    return lemma?.paradigma ?? o.target_id;
  }
  const occorrenza = leggiOccorrenza(o.target_id);
  const forma = occorrenza ? leggiForma(occorrenza.forma_id) : undefined;
  return forma?.forma ?? o.target_id;
}

export default function CustomizationsScreen() {
  const { t } = useTranslation();
  const tema = useTema();
  const styles = useMemo(() => creaStili(tema), [tema]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [caricato, setCaricato] = useState(false);

  const ricarica = useCallback(() => {
    elencaOverrides()
      .then(setOverrides)
      .catch(() => setOverrides([]))
      .finally(() => setCaricato(true));
  }, []);

  useFocusEffect(
    useCallback(() => {
      ricarica();
    }, [ricarica])
  );

  const alRipristinare = async (o: Override) => {
    await ripristinaOriginale(o.target_tipo, o.target_id, o.lingua);
    ricarica();
  };

  const alEsportare = async () => {
    try {
      const file = new File(Paths.cache, FILE_ESPORTAZIONE);
      if (file.exists) file.delete();
      file.create();
      file.write(JSON.stringify(overrides, null, 2));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
      } else {
        Alert.alert(t('personalizzazioni.esportato_titolo'), file.uri);
      }
    } catch (errore) {
      Alert.alert(t('personalizzazioni.errore_esportazione'), String(errore));
    }
  };

  const alImportare = async () => {
    try {
      const risultato = await File.pickFileAsync({ mimeTypes: ['application/json'] });
      if (risultato.canceled) return;
      const file = Array.isArray(risultato.result) ? risultato.result[0] : risultato.result;
      const testo = await file.text();
      const importati = JSON.parse(testo) as Override[];
      for (const o of importati) {
        await salvaOverride(o.target_tipo, o.target_id, o.lingua, o.campi_modificati, o.nota_personale ?? null);
      }
      ricarica();
      Alert.alert(t('personalizzazioni.importati', { count: importati.length }));
    } catch (errore) {
      Alert.alert(t('personalizzazioni.errore_importazione'), String(errore));
    }
  };

  return (
    <View style={styles.contenitore}>
      <View style={styles.barraAzioni}>
        <Pressable
          onPress={alEsportare}
          accessibilityRole="button"
          accessibilityLabel={t('personalizzazioni.esporta')}
          style={styles.pulsanteAzione}
        >
          <Text style={styles.pulsanteAzioneTesto}>{t('personalizzazioni.esporta')}</Text>
        </Pressable>
        <Pressable
          onPress={alImportare}
          accessibilityRole="button"
          accessibilityLabel={t('personalizzazioni.importa')}
          style={styles.pulsanteAzione}
        >
          <Text style={styles.pulsanteAzioneTesto}>{t('personalizzazioni.importa')}</Text>
        </Pressable>
      </View>

      {caricato && overrides.length === 0 ? (
        <Text style={styles.vuoto}>{t('personalizzazioni.vuoto')}</Text>
      ) : (
        <FlatList
          data={overrides}
          keyExtractor={(o) => o.override_id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.carta}>
              <View style={styles.cartaIntestazione}>
                <Text style={styles.nomeTarget}>{etichettaTarget(item)}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeTesto}>{item.lingua}</Text>
                </View>
              </View>
              <Text style={styles.ambito}>
                {item.target_tipo === 'lemma'
                  ? t('personalizzazioni.scope_lemma')
                  : t('personalizzazioni.scope_occorrenza')}
              </Text>
              {Object.entries(item.campi_modificati).map(([campo, valore]) => (
                <View key={campo} style={styles.campo}>
                  <Text style={styles.campoNome}>{campo}</Text>
                  <Text style={styles.campoValore} numberOfLines={2}>
                    {valore}
                  </Text>
                </View>
              ))}
              <Pressable
                onPress={() => alRipristinare(item)}
                accessibilityRole="button"
                accessibilityLabel={t('personalizzazioni.ripristina_tutto')}
                style={styles.pulsanteRipristina}
              >
                <Text style={styles.pulsanteRipristinaTesto}>{t('personalizzazioni.ripristina_tutto')}</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

function creaStili(tema: Tema) {
  return StyleSheet.create({
    contenitore: { flex: 1, backgroundColor: tema.sfondo },
    barraAzioni: {
      flexDirection: 'row',
      gap: SPAZIATURA.sm,
      paddingHorizontal: SPAZIATURA.lg,
      paddingVertical: SPAZIATURA.md,
      borderBottomWidth: 1,
      borderBottomColor: tema.bordo,
    },
    pulsanteAzione: {
      paddingVertical: 6,
      paddingHorizontal: SPAZIATURA.md,
      borderRadius: RAGGIO.pillola,
      borderWidth: 1,
      borderColor: tema.bordo,
      backgroundColor: tema.carta,
    },
    pulsanteAzioneTesto: { fontFamily: FONT.sansMedium, fontSize: 13, color: tema.accento },
    vuoto: {
      fontFamily: FONT.sans,
      fontSize: 14,
      color: tema.testoTenue,
      padding: SPAZIATURA.lg,
      textAlign: 'center',
      marginTop: SPAZIATURA.xl,
    },
    lista: { padding: SPAZIATURA.lg, gap: SPAZIATURA.md },
    carta: {
      backgroundColor: tema.carta,
      borderRadius: RAGGIO.md,
      borderWidth: 1,
      borderColor: tema.bordo,
      padding: SPAZIATURA.md,
    },
    cartaIntestazione: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    nomeTarget: { fontFamily: FONT.serifSemiBold, fontSize: 17, color: tema.testo },
    badge: {
      backgroundColor: tema.sfondo,
      borderRadius: RAGGIO.pillola,
      paddingVertical: 2,
      paddingHorizontal: SPAZIATURA.sm,
      borderWidth: 1,
      borderColor: tema.bordo,
    },
    badgeTesto: { fontFamily: FONT.sansMedium, fontSize: 11, color: tema.testoTenue, textTransform: 'uppercase' },
    ambito: {
      fontFamily: FONT.sans,
      fontSize: 12,
      color: tema.testoTenue,
      marginTop: 2,
      marginBottom: SPAZIATURA.sm,
    },
    campo: { marginBottom: SPAZIATURA.sm },
    campoNome: {
      fontFamily: FONT.sansMedium,
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: tema.testoTenue,
    },
    campoValore: { fontFamily: FONT.sans, fontSize: 14, color: tema.testo, marginTop: 2 },
    pulsanteRipristina: { marginTop: SPAZIATURA.sm, alignSelf: 'flex-start' },
    pulsanteRipristinaTesto: { fontFamily: FONT.sansMedium, fontSize: 12, color: tema.testoTenue },
  });
}
