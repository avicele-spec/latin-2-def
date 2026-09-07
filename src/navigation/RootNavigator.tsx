import { Pressable, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from './types';
import LibraryScreen from '../screens/LibraryScreen';
import ChaptersScreen from '../screens/ChaptersScreen';
import ReadingScreen from '../screens/ReadingScreen';
import TranslationScreen from '../screens/TranslationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomizationsScreen from '../screens/CustomizationsScreen';
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
      <Stack.Screen
        name="Libreria"
        component={LibraryScreen}
        options={({ navigation }) => ({
          title: t('libreria.titolo'),
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('Impostazioni')} hitSlop={10}>
              <Text style={{ fontFamily: FONT.sansMedium, fontSize: 14, color: tema.accento }}>
                {t('libreria.impostazioni')}
              </Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen name="Capitoli" component={ChaptersScreen} options={{ title: '' }} />
      <Stack.Screen name="Lettura" component={ReadingScreen} options={{ title: '', headerShown: false }} />
      <Stack.Screen
        name="Traduzione"
        component={TranslationScreen}
        options={{ title: t('traduzione.titolo'), presentation: 'modal' }}
      />
      <Stack.Screen
        name="Impostazioni"
        component={SettingsScreen}
        options={{ title: t('impostazioni.titolo') }}
      />
      <Stack.Screen
        name="Personalizzazioni"
        component={CustomizationsScreen}
        options={{ title: t('personalizzazioni.titolo') }}
      />
    </Stack.Navigator>
  );
}
