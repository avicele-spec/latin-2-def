import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { useTema } from '../../theme/useTema';
import { Tema, FONT, SPAZIATURA } from '../../theme/tokens';
import TestoConCitazioni from './TestoConCitazioni';

interface Props {
  etichetta: string;
  valore: string;
  modificato: boolean;
  inModifica: boolean;
  onSalva: (nuovoValore: string) => Promise<void>;
  onRipristina: () => Promise<void>;
  /** true per i campi (es. etimologia) dove le citazioni tra apici vanno in corsivo. */
  conCitazioni?: boolean;
}

/**
 * Un campo del popup che, in modalità modifica, diventa un editor di testo
 * con salvataggio e ripristino per sé stesso — lo stesso pattern per-campo
 * dell'app web precedente. Fuori dalla modalità modifica è testo semplice
 * con un punto discreto se il valore mostrato è un override dell'utente.
 */
export default function CampoModificabile({
  etichetta,
  valore,
  modificato,
  inModifica,
  onSalva,
  onRipristina,
  conCitazioni,
}: Props) {
  const { t } = useTranslation();
  const tema = useTema();
  const styles = useMemo(() => creaStili(tema), [tema]);
  const [bozza, setBozza] = useState(valore);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!inModifica) setBozza(valore);
  }, [valore, inModifica]);

  const alSalvare = async () => {
    if (bozza === valore) return;
    setSalvando(true);
    try {
      await onSalva(bozza);
    } catch (errore) {
      console.warn(`Impossibile salvare il campo "${etichetta}":`, errore);
    } finally {
      setSalvando(false);
    }
  };

  const alRipristinare = async () => {
    setSalvando(true);
    try {
      await onRipristina();
    } catch (errore) {
      console.warn(`Impossibile ripristinare il campo "${etichetta}":`, errore);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.sezione}>
      <View style={styles.etichettaRiga}>
        <Text style={styles.etichetta}>{etichetta}</Text>
        {modificato ? <View style={styles.puntinoModificato} /> : null}
      </View>

      {inModifica ? (
        <View>
          <BottomSheetTextInput
            value={bozza}
            onChangeText={setBozza}
            multiline
            style={styles.input}
            placeholderTextColor={tema.testoTenue}
            accessibilityLabel={etichetta}
          />
          <View style={styles.azioniCampo}>
            <Pressable
              onPress={alSalvare}
              disabled={salvando || bozza === valore}
              accessibilityRole="button"
              accessibilityLabel={t('popup.salva_campo')}
              style={styles.pulsanteSalvaCampo}
            >
              {salvando ? (
                <ActivityIndicator size="small" color={tema.accentoTestoSu} />
              ) : (
                <Text style={styles.pulsanteSalvaCampoTesto}>{t('popup.salva_campo')}</Text>
              )}
            </Pressable>
            {modificato ? (
              <Pressable
                onPress={alRipristinare}
                disabled={salvando}
                accessibilityRole="button"
                accessibilityLabel={t('popup.ripristina')}
                style={styles.pulsanteRipristina}
              >
                <Text style={styles.pulsanteRipristinaTesto}>{t('popup.ripristina')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : conCitazioni ? (
        <TestoConCitazioni testo={valore} style={styles.contenutoTesto} />
      ) : (
        <Text style={styles.contenutoTesto}>{valore}</Text>
      )}
    </View>
  );
}

function creaStili(tema: Tema) {
  return StyleSheet.create({
    sezione: { marginBottom: SPAZIATURA.md },
    etichettaRiga: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
    etichetta: {
      fontFamily: FONT.sansMedium,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color: tema.testoTenue,
    },
    puntinoModificato: { width: 5, height: 5, borderRadius: 3, backgroundColor: tema.accento },
    contenutoTesto: { fontFamily: FONT.sans, fontSize: 15, lineHeight: 22, color: tema.testo },
    input: {
      fontFamily: FONT.sans,
      fontSize: 15,
      lineHeight: 21,
      color: tema.testo,
      borderWidth: 1,
      borderColor: tema.bordo,
      borderRadius: 8,
      padding: SPAZIATURA.sm,
      minHeight: 70,
      textAlignVertical: 'top',
      backgroundColor: tema.sfondo,
    },
    azioniCampo: { flexDirection: 'row', gap: SPAZIATURA.sm, marginTop: SPAZIATURA.sm },
    pulsanteSalvaCampo: {
      backgroundColor: tema.accento,
      borderRadius: 6,
      paddingVertical: 6,
      paddingHorizontal: SPAZIATURA.md,
      minWidth: 72,
      alignItems: 'center',
    },
    pulsanteSalvaCampoTesto: { fontFamily: FONT.sansMedium, fontSize: 13, color: tema.accentoTestoSu },
    pulsanteRipristina: { paddingVertical: 6, paddingHorizontal: SPAZIATURA.sm },
    pulsanteRipristinaTesto: { fontFamily: FONT.sansMedium, fontSize: 13, color: tema.testoTenue },
  });
}
