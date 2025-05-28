import { SLIDE_HEIGHT } from "@/constants/heights";
import { RAW_REVIEWS } from "@/constants/mock";
import { IBook } from "@/types/books";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";

type ReviewItem = (typeof RAW_REVIEWS)[number] & {
  id: string;
  snippet: string;
};

export const BookSlideItem: React.FC<{ item: IBook }> = ({ item }) => {
  /* анимация обложки */
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  /* bottom-sheet для списка и modal для полного текста */
  const commentModalRef = useRef<BottomSheetModal | null>(null);
  /* для Modal */
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [fullVisible, setFullVisible] = useState(false);

  /* чтобы вернуть лист */
  const [lastSnapIndex, setLastSnapIndex] = useState(0);
  const [pendingReview, setPendingReview] = useState<ReviewItem | null>(null);

  /* нормализуем данные */
  const reviews: ReviewItem[] = useMemo(
    () =>
      RAW_REVIEWS.map((r, i) => ({
        ...r,
        id: `${i}`,
        snippet:
          r.text.length > 125 ? r.text.slice(0, 125).trimEnd() + "…" : r.text,
      })),
    []
  );

  const scale = useRef(new Animated.Value(0.9)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const runShow = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const runHide = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => cb?.());
  };

  /* helpers */
  const toggleAnnotation = () => {
    Animated.timing(anim, {
      toValue: showAnnotation ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowAnnotation((p) => !p);
  };
  const share = () =>
    Share.share({
      title: item.title,
      message: `Зацени книжку! \n\n${item.title} \n\nhttps://openlibrary.org/${item.key}`,
    });
  const openComments = () => commentModalRef.current?.present();

  /* тап по карточке рецензии */
  const openFull = (review: ReviewItem) => {
    setPendingReview(review); // запоминаем
    commentModalRef.current?.dismiss(); // прячем лист
  };

  /* Modal закрылся → возвращаем лист */
  const closeFull = () => {
    runHide(() => {
      setFullVisible(false); // прячем Modal
      commentModalRef.current?.present(lastSnapIndex); // возвращаем лист
    });
  };

  /* opacity для метаданных */
  const metaOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    []
  );

  /* ───────────── JSX ───────────── */
  return (
    <>
      {/* СЛАЙД */}
      <Pressable onPress={toggleAnnotation} style={{ height: SLIDE_HEIGHT }}>
        <Image
          source={{
            uri: `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`,
          }}
          className="absolute inset-0"
          resizeMode="cover"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <ActivityIndicator
            className="absolute inset-0"
            size="large"
            color="#fff"
          />
        )}
        <View className="absolute inset-0 bg-black/30" />

        {/* заголовок/автор */}
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

        {/* описание */}
        <Animated.View
          style={{ opacity: anim }}
          className="absolute inset-0 bg-black/70 py-20 px-6"
        >
          <Text className="text-white text-[24px] leading-7">Авторы:</Text>
          {item?.author_name?.length ? (
            item.author_name.map((a) => (
              <Text key={a} className="text-zinc-300 text-[20px]">
                {a}
              </Text>
            ))
          ) : (
            <Text className="text-zinc-300 text-[20px]">Неизвестный автор</Text>
          )}
        </Animated.View>

        {/* action-buttons */}
        <Animated.View
          style={{ opacity: metaOpacity }}
          className="absolute right-4 bottom-64 items-center"
        >
          <AnimatedPressable
            onPress={() => setIsLiked((p) => !p)}
            hitSlop={20}
            className={"items-center"}
          >
            <AntDesign
              name={isLiked ? "heart" : "hearto"}
              size={24}
              color="white"
            />
            <Text className="text-white mt-1 font-medium">1408</Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={openComments}
            className="mt-10 items-center"
            hitSlop={20}
          >
            <FontAwesome name="comment-o" size={24} color="white" />
          </AnimatedPressable>

          <AnimatedPressable
            onPress={share}
            className="mt-10 items-center"
            hitSlop={20}
          >
            <Feather name="share" size={24} color="white" />
          </AnimatedPressable>
        </Animated.View>
      </Pressable>

      {/* BOTTOM-SHEET: список рецензий */}
      <BottomSheetModal
        ref={commentModalRef}
        snapPoints={["65%", "95%"]}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "#18181b" }}
        handleIndicatorStyle={{ backgroundColor: "#52525b" }}
        onChange={(idx) => setLastSnapIndex(idx)} // запоминаем позицию
        onDismiss={() => {
          if (pendingReview) {
            setSelectedReview(pendingReview);
            setFullVisible(true); // показываем модалку
            runShow(); // запускаем zoom-fade
            setPendingReview(null);
          }
        }}
      >
        <BottomSheetFlatList
          data={reviews}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openFull(item)}
              className="flex-row gap-3 mb-5"
            >
              <Image
                source={{ uri: item.user.avatar }}
                className="w-9 h-9 rounded-full"
              />
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-zinc-100 font-semibold">
                    {item.user.name}
                  </Text>
                  <View className="flex-row ml-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <AntDesign
                        key={idx}
                        name={idx < item.rating ? "star" : "staro"}
                        size={14}
                        color="#eab308"
                        className="ml-0.5"
                      />
                    ))}
                  </View>
                </View>
                <Text className="text-zinc-400 text-xs mb-1">{item.date}</Text>
                <Text className="text-zinc-300 text-sm leading-5">
                  {item.snippet}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </BottomSheetModal>

      {/* ── Modal с полной рецензией ─────── */}
      <Modal
        transparent
        visible={fullVisible}
        animationType="none"
        onRequestClose={closeFull}
      >
        {/* backdrop ⟶ просто Pressable с fade-альфой */}
        <Animated.View style={{ opacity: fade }} className="flex-1 bg-black/60">
          {/* клик по фону закрывает */}
          <Pressable className="flex-1" onPress={closeFull}>
            {/* центрируем контент */}
            <View className="flex-1 justify-center items-center">
              <Animated.View
                style={{ transform: [{ scale }] }}
                className="w-[90%] max-h-[80%] bg-zinc-900 rounded-2xl"
              >
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                  {/* шапка */}
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: selectedReview?.user.avatar }}
                      className="w-12 h-12 rounded-full"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-zinc-100 font-semibold text-lg">
                        {selectedReview?.user.name}
                      </Text>
                      <View className="flex-row mt-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <AntDesign
                            key={idx}
                            name={
                              idx < (selectedReview?.rating ?? 0)
                                ? "star"
                                : "staro"
                            }
                            size={14}
                            color="#eab308"
                            className="ml-0.5"
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  {/* текст */}
                  <Text className="text-zinc-200 text-base leading-6 mt-4">
                    {selectedReview?.text}
                  </Text>
                </ScrollView>
              </Animated.View>
            </View>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
};
