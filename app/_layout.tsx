import { GestureHandlerRootView } from "react-native-gesture-handler";

import { queryClient } from "@/config/apiClient";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./global.css";

if (__DEV__) {
  require("../Reactotron");
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <GestureHandlerRootView className="flex-1">
        <QueryClientProvider client={queryClient}>
          <StatusBar backgroundColor={"black"} />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
