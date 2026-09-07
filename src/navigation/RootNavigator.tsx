import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from './types';
import LibraryScreen from '../screens/LibraryScreen';
import ChaptersScreen from '../screens/ChaptersScreen';
import ReadingScreen from '../screens/ReadingScreen';
import { TEMI, FONT } from '../theme/tokens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { t } = useTranslation();
  const tema = TEMI.chiaro;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: tema.sfondo },
        headerShadowVisible: false,
        headerTintColor: tema.accento,
        headerTitleStyle: { fontFamily: FONT.serifSemiBold, color: tema.testo, fontSize: 18 },
        headerBackTitle: '',
        contentStyle: { backgroundColor: tema.sfondo },
      }}
    >
      <Stack.Screen name="Libreria" component={LibraryScreen} options={{ title: t('libreria.titolo') }} />
      <Stack.Screen name="Capitoli" component={ChaptersScreen} options={{ title: '' }} />
      <Stack.Screen name="Lettura" component={ReadingScreen} options={{ title: '', headerShown: false }} />
    </Stack.Navigator>
  );
}
