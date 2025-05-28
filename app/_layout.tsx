import { GestureHandlerRootView } from "react-native-gesture-handler";

import { queryClient } from "@/config/apiClient";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import ToastManager from "toastify-react-native";

import "./global.css";

if (__DEV__) {
  require("../Reactotron");
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <GestureHandlerRootView className="flex-1">
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar backgroundColor={"black"} />
            <ToastManager theme={"dark"} useModal={false} />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </QueryClientProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
