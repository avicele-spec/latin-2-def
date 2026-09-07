export type RootStackParamList = {
  Libreria: undefined;
  Capitoli: { operaSlug: string };
  Lettura: { operaSlug: string; libro: number; capitolo: number; paragrafo?: number };
};
