import { create } from 'zustand';
import i18n from '../i18n/config';
import { leggiImpostazioni, scriviImpostazione } from '../data/db/impostazioni';
import { Impostazioni, IMPOSTAZIONI_DEFAULT } from '../types/db';
import { linguaDispositivo } from '../i18n/lingue';

interface SettingsState extends Impostazioni {
  caricata: boolean;
  carica: () => Promise<void>;
  impostaLingua: (lingua: string) => Promise<void>;
  impostaDimensioneTesto: (dimensione: Impostazioni['dimensione_testo']) => Promise<void>;
  impostaTema: (tema: Impostazioni['tema']) => Promise<void>;
  impostaMostraParoleConsultate: (valore: boolean) => Promise<void>;
  impostaMostraMacron: (valore: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...IMPOSTAZIONI_DEFAULT,
  // Stessa scelta di i18n/config.ts, così interfaccia e contenuti sono già
  // allineati al primo render, prima ancora che carica() risolva.
  lingua: linguaDispositivo(),
  caricata: false,

  carica: async () => {
    try {
      const impostazioni = await leggiImpostazioni();
      set({ ...impostazioni, caricata: true });
      if (i18n.language !== impostazioni.lingua) {
        await i18n.changeLanguage(impostazioni.lingua);
      }
    } catch (errore) {
      // Es. expo-sqlite non disponibile (target web di verifica): si resta
      // con i default già impostati (device locale) invece di bloccarsi.
      console.warn('Impostazioni non lette da SQLite, uso i default:', errore);
      set({ caricata: true });
    }
  },

  impostaLingua: async (lingua) => {
    set({ lingua });
    await scriviImpostazione('lingua', lingua);
    await i18n.changeLanguage(lingua);
  },

  impostaDimensioneTesto: async (dimensione_testo) => {
    set({ dimensione_testo });
    await scriviImpostazione('dimensione_testo', dimensione_testo);
  },

  impostaTema: async (tema) => {
    set({ tema });
    await scriviImpostazione('tema', tema);
  },

  impostaMostraParoleConsultate: async (mostra_parole_consultate) => {
    set({ mostra_parole_consultate });
    await scriviImpostazione('mostra_parole_consultate', mostra_parole_consultate);
  },

  impostaMostraMacron: async (mostra_macron) => {
    set({ mostra_macron });
    await scriviImpostazione('mostra_macron', mostra_macron);
  },
}));
