import { queryClient } from "@/config/apiClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./global.css";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar backgroundColor={"black"} />
      <Stack />
    </QueryClientProvider>
  );
}
