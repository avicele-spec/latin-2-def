import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSettingsStore } from '../store/useSettingsStore';
import { lingueAttive } from '../i18n/lingue';
import { DimensioneTesto, TEMI, FONT, SPAZIATURA, RAGGIO } from '../theme/tokens';

const tema = TEMI.chiaro;
const DIMENSIONI: DimensioneTesto[] = ['piccolo', 'medio', 'grande'];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const lingua = useSettingsStore((s) => s.lingua);
  const dimensioneTesto = useSettingsStore((s) => s.dimensione_testo);
  const mostraParoleConsultate = useSettingsStore((s) => s.mostra_parole_consultate);
  const impostaLingua = useSettingsStore((s) => s.impostaLingua);
  const impostaDimensioneTesto = useSettingsStore((s) => s.impostaDimensioneTesto);
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
