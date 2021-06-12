import React from "react";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "react-native-magnus";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./constants/theme";
import * as SplashScreen from "expo-splash-screen";

import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation";
import store from "./redux/store";
import { Provider } from "react-redux";
import { useColorScheme, View } from "react-native";
import { AuthProvider } from "lib/auth";
import { registerRootComponent } from "expo";
import RenderSplashScreen from "components/RenderSplashScreen";

function App() {
  const isCachedResourcesLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isCachedResourcesLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <Provider store={store}>
              {/* <RenderSplashScreen
                isCachedResourcesLoadingComplete={
                  isCachedResourcesLoadingComplete
                }
              > */}
              <Navigation colorScheme={colorScheme} />
              <StatusBar
                style="dark"
                backgroundColor={theme.colors.primary600}
              />
              {/* </RenderSplashScreen> */}
            </Provider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }
}

registerRootComponent(App);

export default App;