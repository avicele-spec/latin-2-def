import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
  SourceSerif4_600SemiBold,
} from '@expo-google-fonts/source-serif-4';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

import './src/i18n/config';
import RootNavigator from './src/navigation/RootNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useReadingStore } from './src/store/useReadingStore';
import { leggiOnboardingCompletato, segnaOnboardingCompletato } from './src/data/db/impostazioni';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsCaricati] = useFonts({
    SourceSerif4_400Regular,
    SourceSerif4_400Regular_Italic,
    SourceSerif4_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [datiCaricati, setDatiCaricati] = useState(false);
  const [onboardingCompletato, setOnboardingCompletato] = useState(false);
  const carica = useSettingsStore((s) => s.carica);
  const caricaOccorrenzeConsultate = useReadingStore((s) => s.caricaOccorrenzeConsultate);
  const nomeTema = useSettingsStore((s) => s.tema);

  useEffect(() => {
    Promise.all([carica(), caricaOccorrenzeConsultate(), leggiOnboardingCompletato()])
      .then(([, , completato]) => setOnboardingCompletato(completato))
      .catch((errore) => console.warn('Errore in avvio:', errore))
      .finally(() => setDatiCaricati(true));
  }, [carica, caricaOccorrenzeConsultate]);

  const alTerminareOnboarding = () => {
    setOnboardingCompletato(true);
    void segnaOnboardingCompletato().catch((errore) =>
      console.warn('Impossibile salvare il completamento onboarding:', errore)
    );
  };

  const pronto = fontsCaricati && datiCaricati;

  const alLayoutRadice = useCallback(async () => {
    if (pronto) await SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={alLayoutRadice}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar style={nomeTema === 'scuro' ? 'light' : 'dark'} />
          {onboardingCompletato ? (
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          ) : (
            <OnboardingScreen onFine={alTerminareOnboarding} />
          )}
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
