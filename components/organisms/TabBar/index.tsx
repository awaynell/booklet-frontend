import { twClsx } from "@/utils/twClsx";
import AntDesign from "@expo/vector-icons/AntDesign";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TabBar = ({ descriptors, state, navigation }: BottomTabBarProps) => {
  return (
    <SafeAreaView edges={["bottom"]} className="relative">
      <View className="bg-slate-900">
        <View className="w-full flex-row items-end justify-between py-3">
          {state.routes.map((item, index) => {
            const isSelected = state.index === index;

            const getIconName = () => {
              switch (item.name) {
                case "index":
                  return "book";
                case "profile":
                  return "profile";
              }
            };

            const iconName = getIconName();

            const color = isSelected ? "white" : "#cbd5e1";

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: item.key,
                canPreventDefault: true,
              });

              if (!isSelected && !event.defaultPrevented) {
                navigation.navigate(item.name, { merge: true });
              }
            };
            return (
              <TouchableOpacity
                key={item.key}
                onPress={onPress}
                className={twClsx("items-center w-1/2")}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <AntDesign name={iconName} size={24} color={color} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TabBar;
