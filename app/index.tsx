import { BookSlider } from "@/components/organisms/BookSlider";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  });

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-orange-100">
        <BookSlider />
      </View>
    </SafeAreaView>
  );
}
