import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { Occorrenza } from '../../types/content';
import { componiParola, testoConFallback } from '../../data/loadContent';
import { useSettingsStore } from '../../store/useSettingsStore';
import { etichettaDiscendenti, configurazioneLingua, conFallback } from '../../i18n/lingue';
import { aggiungiAlVocabolario, eLemmaNelVocabolario } from '../../data/db/vocabolario';
import { TEMI, FONT, SPAZIATURA, RAGGIO } from '../../theme/tokens';
import PopupSection from './PopupSection';

const tema = TEMI.chiaro;

export const ALTEZZA_MASSIMA_POPUP = Math.round(Dimensions.get('window').height * 0.62);

export interface WordPopupSheetRef {
  mostra: (occorrenza: Occorrenza) => void;
  nascondi: () => void;
}

interface Props {
  onDismiss?: () => void;
}

const WordPopupSheet = forwardRef<WordPopupSheetRef, Props>(function WordPopupSheet({ onDismiss }, ref) {
  const { t } = useTranslation();
  const lingua = useSettingsStore((s) => s.lingua);
  const modalRef = useRef<BottomSheetModal>(null);
  const [occorrenza, setOccorrenza] = useState<Occorrenza | null>(null);
  const [salvata, setSalvata] = useState(false);

  useImperativeHandle(ref, () => ({
    mostra: (nuovaOccorrenza) => {
      setOccorrenza(nuovaOccorrenza);
      modalRef.current?.present();
    },
    nascondi: () => modalRef.current?.dismiss(),
  }));

  const parola = useMemo(() => (occorrenza ? componiParola(occorrenza.forma_id) : undefined), [occorrenza]);

  useEffect(() => {
    if (!parola) return;
    let annullato = false;
    eLemmaNelVocabolario(parola.lemma.lemma_id).then((esiste) => {
      if (!annullato) setSalvata(esiste);
    });
    return () => {
      annullato = true;
    };
  }, [parola]);

  const alSalvare = async () => {
    if (!parola || salvata) return;
    try {
      await aggiungiAlVocabolario(parola.lemma.lemma_id);
      setSalvata(true);
    } catch (errore) {
      console.warn('Impossibile salvare nel vocabolario:', errore);
    }
  };

  const dettagli = parola && occorrenza ? costruisciDettagli(parola, occorrenza, lingua) : null;

  return (
    <BottomSheetModal
      ref={modalRef}
      enableDynamicSizing
      onDismiss={onDismiss}
      backgroundStyle={styles.sfondoFoglio}
      handleIndicatorStyle={styles.maniglia}
    >
      <BottomSheetScrollView style={{ maxHeight: ALTEZZA_MASSIMA_POPUP }} contentContainerStyle={styles.contenuto}>
        {dettagli ? (
          <>
            <View style={styles.intestazione}>
              <View style={styles.intestazioneRiga}>
                <Text style={styles.formaOriginale}>{dettagli.forma.forma}</Text>
                <Pressable
                  onPress={() => modalRef.current?.dismiss()}
                  hitSlop={12}
                  accessibilityLabel={t('popup.chiudi')}
                  style={styles.pulsanteChiudi}
                >
                  <Text style={styles.pulsanteChiudiTesto}>×</Text>
                </Pressable>
              </View>
              <Text style={styles.paradigma}>
                <Text style={styles.paradigmaGrassetto}>{dettagli.lemma.paradigma}</Text>
                {'  —  '}
                {t(`popup.categoria_${dettagli.lemma.categoria}`, { defaultValue: dettagli.lemma.categoria })}
                {'  —  '}
                {conFallback(dettagli.lemma.significati_base, lingua)?.[0] ?? ''}
              </Text>
              <Text style={styles.formaGrammaticale}>{testoConFallback(dettagli.analisi, lingua)}</Text>
            </View>

            <PopupSection etichetta={t('popup.traduzione')}>
              {testoConFallback(dettagli.occorrenza.traduzione_contestuale, lingua)}
            </PopupSection>

            {dettagli.notaSintattica ? (
              <PopupSection etichetta={t('popup.nota_sintattica')}>{dettagli.notaSintattica}</PopupSection>
            ) : null}

            {dettagli.lemma.etimologia.mostrare ? (
              <PopupSection etichetta={t('popup.etimologia')}>
                {testoConFallback(dettagli.lemma.etimologia.testo, lingua)}
              </PopupSection>
            ) : null}

            {dettagli.discendenti && (dettagli.discendenti.voci.length > 0 || dettagli.discendenti.nota) ? (
              <PopupSection
                etichetta={
                  dettagli.etichettaDisc === 'imparentate'
                    ? t('popup.imparentate', { lingua: dettagli.nomeLingua })
                    : t('popup.discendenti')
                }
              >
                <View>
                  {dettagli.discendenti.voci.length > 0 ? (
                    <Text style={styles.discendentiVoci}>{dettagli.discendenti.voci.join(', ')}</Text>
                  ) : null}
                  {dettagli.discendenti.nota ? (
                    <Text style={styles.discendentiNota}>{dettagli.discendenti.nota}</Text>
                  ) : null}
                </View>
              </PopupSection>
            ) : null}

            <View style={styles.azioni}>
              <Pressable
                onPress={alSalvare}
                disabled={salvata}
                style={[styles.pulsanteSalva, salvata && styles.pulsanteSalvaFatto]}
              >
                <Text style={[styles.pulsanteSalvaTesto, salvata && styles.pulsanteSalvaTestoFatto]}>
                  {salvata ? `✓ ${t('popup.salvata')}` : t('popup.salva_vocabolario')}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

function costruisciDettagli(
  parola: NonNullable<ReturnType<typeof componiParola>>,
  occorrenza: Occorrenza,
  lingua: string
) {
  const { forma, lemma } = parola;
  const analisi =
    occorrenza.analisi_scelta === 0
      ? forma.analisi_morfologica
      : forma.analisi_alternative?.[occorrenza.analisi_scelta - 1] ?? forma.analisi_morfologica;

  return {
    forma,
    lemma,
    occorrenza,
    analisi,
    notaSintattica: occorrenza.nota_sintattica ? testoConFallback(occorrenza.nota_sintattica, lingua) : null,
    discendenti: conFallback(lemma.discendenti, lingua),
    etichettaDisc: etichettaDiscendenti(lingua),
    nomeLingua: configurazioneLingua(lingua)?.nome_nativo ?? lingua,
  };
}

export default WordPopupSheet;

const styles = StyleSheet.create({
  sfondoFoglio: { backgroundColor: tema.carta, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  maniglia: { backgroundColor: tema.bordo, width: 36 },
  contenuto: { paddingHorizontal: SPAZIATURA.lg, paddingTop: SPAZIATURA.sm, paddingBottom: SPAZIATURA.xl },
  intestazione: { marginBottom: SPAZIATURA.md, borderBottomWidth: 1, borderBottomColor: tema.bordo, paddingBottom: SPAZIATURA.md },
  intestazioneRiga: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  pulsanteChiudi: { padding: 2, marginLeft: SPAZIATURA.sm },
  pulsanteChiudiTesto: { fontFamily: FONT.sans, fontSize: 22, lineHeight: 24, color: tema.testoTenue },
  formaOriginale: { fontFamily: FONT.serifSemiBold, fontSize: 26, color: tema.testo },
  paradigma: { fontFamily: FONT.serif, fontSize: 14, color: tema.testoTenue, marginTop: 4 },
  paradigmaGrassetto: { fontFamily: FONT.serifSemiBold, color: tema.accento },
  formaGrammaticale: { fontFamily: FONT.sans, fontSize: 13, color: tema.testoTenue, fontStyle: 'italic', marginTop: 4 },
  discendentiVoci: { fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 15, color: tema.testo, lineHeight: 22 },
  discendentiNota: { fontFamily: FONT.sans, fontSize: 14, color: tema.testoTenue, lineHeight: 20, marginTop: 4 },
  azioni: { marginTop: SPAZIATURA.sm, flexDirection: 'row' },
  pulsanteSalva: {
    backgroundColor: tema.accento,
    borderRadius: RAGGIO.pillola,
    paddingVertical: 10,
    paddingHorizontal: SPAZIATURA.lg,
  },
  pulsanteSalvaFatto: { backgroundColor: tema.carta, borderWidth: 1, borderColor: tema.bordo },
  pulsanteSalvaTesto: { fontFamily: FONT.sansMedium, fontSize: 14, color: tema.accentoTestoSu },
  pulsanteSalvaTestoFatto: { color: tema.testoTenue },
});
