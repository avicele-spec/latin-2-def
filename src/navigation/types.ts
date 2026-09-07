export type RootStackParamList = {
  Libreria: undefined;
  Capitoli: { operaSlug: string };
  Lettura: { operaSlug: string; libro: number; capitolo: number; paragrafo?: number };
  Traduzione: { operaSlug: string; libro: number; capitolo: number; paragrafoIniziale: number };
  Impostazioni: undefined;
};
