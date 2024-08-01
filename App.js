import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from "./src/screens/LoginScreen.js";
import AppNavigator from "./src/navigation/AppNavigator.js";
import Toast from "react-native-toast-message";
import LoginNavigator from "./src/navigation/LoginNavigator.js";
import { UserProvider } from "./src/usuario.js";

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <AppNavigator />
        <Toast />
      </UserProvider>
    </GestureHandlerRootView>
  );
};

export default App;
