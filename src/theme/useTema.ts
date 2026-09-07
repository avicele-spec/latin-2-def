import { useSettingsStore } from '../store/useSettingsStore';
import { TEMI, Tema } from './tokens';

/** Il tema attivo, derivato dall'impostazione salvata dall'utente. */
export function useTema(): Tema {
  const nomeTema = useSettingsStore((s) => s.tema);
  return TEMI[nomeTema];
}
