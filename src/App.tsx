import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store, loadPersistedState } from './store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import RootNavigator from './navigation/RootNavigator';
import { ThemeProvider } from './theme/ThemeProvider';

export default function App() {
  useEffect(() => {
    loadPersistedState();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
} 