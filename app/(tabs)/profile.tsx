import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = () => {
  return (
    <SafeAreaView className="items-center">
      <Text className="text-[24px] text-slate-50">
        В будущем здесь будет профиль
      </Text>
    </SafeAreaView>
  );
};

export default ProfileScreen;
