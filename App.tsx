import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CanvasScreen } from './app/screens/CanvasScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#09111F" />
      <CanvasScreen />
    </SafeAreaProvider>
  );
}

export default App;
