import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../navigation/types';
import { useSettingsStore } from '../store/useSettingsStore';
import { lingueAttive } from '../i18n/lingue';
import { useTema } from '../theme/useTema';
import { DimensioneTesto, NomeTema, Tema, FONT, SPAZIATURA, RAGGIO } from '../theme/tokens';

const DIMENSIONI: DimensioneTesto[] = ['piccolo', 'medio', 'grande'];
const TEMI_DISPONIBILI: NomeTema[] = ['chiaro', 'scuro', 'seppia'];

type Props = NativeStackScreenProps<RootStackParamList, 'Impostazioni'>;

export default function SettingsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const tema = useTema();
  const styles = useMemo(() => creaStili(tema), [tema]);
  const lingua = useSettingsStore((s) => s.lingua);
  const dimensioneTesto = useSettingsStore((s) => s.dimensione_testo);
  const nomeTema = useSettingsStore((s) => s.tema);
  const mostraParoleConsultate = useSettingsStore((s) => s.mostra_parole_consultate);
  const impostaLingua = useSettingsStore((s) => s.impostaLingua);
  const impostaDimensioneTesto = useSettingsStore((s) => s.impostaDimensioneTesto);
  const impostaTema = useSettingsStore((s) => s.impostaTema);
  const impostaMostraParoleConsultate = useSettingsStore((s) => s.impostaMostraParoleConsultate);

  return (
    <ScrollView style={styles.contenitore} contentContainerStyle={styles.corpo}>
      <View style={styles.sezione}>
        <Text style={styles.etichettaSezione}>{t('impostazioni.lingua')}</Text>
        <View style={styles.carta}>
          {lingueAttive().map((l, indice) => (
            <Pressable
              key={l.codice}
              onPress={() => impostaLingua(l.codice)}
              accessibilityRole="radio"
              accessibilityState={{ selected: lingua === l.codice }}
              accessibilityLabel={l.nome_nativo}
              style={[styles.riga, indice > 0 && styles.rigaSeparata]}
            >
              <Text style={styles.rigaTesto}>{l.nome_nativo}</Text>
              {lingua === l.codice ? <Text style={styles.segnoSelezione}>✓</Text> : null}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sezione}>
        <Text style={styles.etichettaSezione}>{t('impostazioni.dimensione_testo')}</Text>
        <View style={styles.selettorePillole}>
          {DIMENSIONI.map((d) => (
            <Pressable
              key={d}
              onPress={() => impostaDimensioneTesto(d)}
              accessibilityRole="radio"
              accessibilityState={{ selected: dimensioneTesto === d }}
              accessibilityLabel={t(`impostazioni.${d}`)}
              style={[styles.pillola, dimensioneTesto === d && styles.pillolaAttiva]}
            >
              <Text style={[styles.pillolaTesto, dimensioneTesto === d && styles.pillolaTestoAttivo]}>
                {t(`impostazioni.${d}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sezione}>
        <Text style={styles.etichettaSezione}>{t('impostazioni.tema')}</Text>
        <View style={styles.selettorePillole}>
          {TEMI_DISPONIBILI.map((nome) => (
            <Pressable
              key={nome}
              onPress={() => impostaTema(nome)}
              accessibilityRole="radio"
              accessibilityState={{ selected: nomeTema === nome }}
              accessibilityLabel={t(`impostazioni.${nome}`)}
              style={[styles.pillola, nomeTema === nome && styles.pillolaAttiva]}
            >
              <Text style={[styles.pillolaTesto, nomeTema === nome && styles.pillolaTestoAttivo]}>
                {t(`impostazioni.${nome}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sezione}>
        <View style={[styles.carta, styles.rigaInterruttore]}>
          <View style={styles.testoInterruttore}>
            <Text style={styles.rigaTesto}>{t('impostazioni.mostra_parole_consultate')}</Text>
            <Text style={styles.notaInterruttore}>{t('impostazioni.mostra_parole_consultate_nota')}</Text>
          </View>
          <Switch
            value={mostraParoleConsultate}
            onValueChange={impostaMostraParoleConsultate}
            trackColor={{ true: tema.accento, false: tema.bordo }}
          />
        </View>
      </View>

      <View style={styles.sezione}>
        <Pressable
          style={[styles.carta, styles.riga]}
          onPress={() => navigation.navigate('Personalizzazioni')}
          accessibilityRole="button"
          accessibilityLabel={t('impostazioni.personalizzazioni')}
        >
          <Text style={styles.rigaTesto}>{t('impostazioni.personalizzazioni')}</Text>
          <Text style={styles.segnoSelezione}>›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function creaStili(tema: Tema) {
  return StyleSheet.create({
    contenitore: { flex: 1, backgroundColor: tema.sfondo },
    corpo: { padding: SPAZIATURA.lg, gap: SPAZIATURA.xl, paddingBottom: SPAZIATURA.xxl },
    sezione: { gap: SPAZIATURA.sm },
    etichettaSezione: {
      fontFamily: FONT.sansMedium,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: tema.testoTenue,
    },
    carta: {
      backgroundColor: tema.carta,
      borderRadius: RAGGIO.md,
      borderWidth: 1,
      borderColor: tema.bordo,
      overflow: 'hidden',
    },
    riga: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPAZIATURA.md,
      paddingHorizontal: SPAZIATURA.md,
    },
    rigaSeparata: { borderTopWidth: 1, borderTopColor: tema.bordo },
    rigaTesto: { fontFamily: FONT.sans, fontSize: 15, color: tema.testo },
    segnoSelezione: { fontFamily: FONT.sansMedium, fontSize: 15, color: tema.accento },
    selettorePillole: { flexDirection: 'row', gap: SPAZIATURA.sm },
    pillola: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: SPAZIATURA.sm,
      borderRadius: RAGGIO.pillola,
      borderWidth: 1,
      borderColor: tema.bordo,
      backgroundColor: tema.carta,
    },
    pillolaAttiva: { backgroundColor: tema.accento, borderColor: tema.accento },
    pillolaTesto: { fontFamily: FONT.sansMedium, fontSize: 13, color: tema.testoTenue },
    pillolaTestoAttivo: { color: tema.accentoTestoSu },
    rigaInterruttore: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPAZIATURA.md,
    },
    testoInterruttore: { flex: 1, marginRight: SPAZIATURA.md, gap: 2 },
    notaInterruttore: { fontFamily: FONT.sans, fontSize: 12, color: tema.testoTenue },
  });
}
