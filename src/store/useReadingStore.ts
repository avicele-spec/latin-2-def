import { create } from 'zustand';
import { Posizione } from '../types/content';
import { salvaProgresso } from '../data/db/progresso';
import { segnaConsultata, leggiOccorrenzeConsultate } from '../data/db/voceConsultata';

interface ReadingState {
  occorrenzeConsultate: Set<string>;
  caricaOccorrenzeConsultate: () => Promise<void>;
  segnaOccorrenzaConsultata: (occorrenzaId: string) => void;
  salvaPosizioneCorrente: (operaSlug: string, posizione: Posizione) => void;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  occorrenzeConsultate: new Set(),

  caricaOccorrenzeConsultate: async () => {
    const set_ = await leggiOccorrenzeConsultate();
    set({ occorrenzeConsultate: set_ });
  },

  segnaOccorrenzaConsultata: (occorrenzaId) => {
    if (get().occorrenzeConsultate.has(occorrenzaId)) return;
    const aggiornato = new Set(get().occorrenzeConsultate);
    aggiornato.add(occorrenzaId);
    set({ occorrenzeConsultate: aggiornato });
    void segnaConsultata(occorrenzaId);
  },

  salvaPosizioneCorrente: (operaSlug, posizione) => {
    void salvaProgresso(operaSlug, posizione);
  },
}));
