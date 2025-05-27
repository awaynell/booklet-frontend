import { SLIDE_HEIGHT } from "@/constants/heights";
import { IBook } from "@/types/books";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

export const BookSlideItem: React.FC<{ item: IBook }> = ({ item }) => {
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggleAnnotation = () => {
    Animated.timing(anim, {
      toValue: showAnnotation ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowAnnotation((prev) => !prev);
  };

  const metaOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <Pressable onPress={toggleAnnotation} style={{ height: SLIDE_HEIGHT }}>
      {/* Обложка */}
      <Image
        source={{
          uri: `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`,
        }}
        className="absolute inset-0"
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />

      {/* Спиннер пока загрузка */}
      {loading && (
        <ActivityIndicator
          className="absolute inset-0"
          size="large"
          color="#fff"
        />
      )}

      {/* Темный оверлей */}
      <View className="absolute inset-0 bg-black/30" />

      {/* Мета-контент с анимацией */}
      <Animated.View
        style={{ opacity: metaOpacity }}
        className="absolute inset-0"
      >
        <View className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent" />
        <View className="flex-1 justify-end p-6 mb-4">
          <Text className="text-white text-4xl font-bold mb-2">
            {item.title}
          </Text>
          <Text className="text-zinc-300 text-xl">{item.author}</Text>
        </View>
      </Animated.View>

      {/* Блок с описанием */}
      <Animated.View
        style={{ opacity: anim }}
        className="absolute inset-0 bg-black/70 py-20 px-6"
      >
        <Text className="text-white text-[24px] leading-7">{"Авторы:"}</Text>
        {item.author_name.map((author) => (
          <Text key={author} className="text-zinc-300 text-[20px]">
            {author}
          </Text>
        ))}
      </Animated.View>
      <AnimatedPressable
        style={{ opacity: metaOpacity }}
        className="absolute right-4 bottom-64 items-center"
        onPress={() => {
          setIsLiked((prev) => !prev);
        }}
        hitSlop={20}
      >
        <AntDesign
          name={isLiked ? "heart" : "hearto"}
          size={24}
          color="white"
        />
        <Text className="text-white mt-1 font-medium">1408</Text>
      </AnimatedPressable>
    </Pressable>
  );
};
