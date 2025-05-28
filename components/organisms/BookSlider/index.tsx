import { useBooks } from "@/api/books/hooks";
import { SwipeableBookCard } from "@/components/molecules/BookSlide/SwipableCard";
import { SLIDE_HEIGHT } from "@/constants/heights";
import { IBook } from "@/types/books";
import { useScrollToTop } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
  ViewToken,
} from "react-native";
import { Toast } from "toastify-react-native";

export const BookSlider = () => {
  const flatListRef = useRef<FlatList>(null);
  const onEndReachedCalled = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollTo = (idx: number) =>
    flatListRef.current?.scrollToIndex({ index: idx, animated: true });

  useScrollToTop(flatListRef);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useBooks();

  // Собираем все страницы в один массив
  const books = useMemo(
    () => data?.pages?.flatMap((p) => p?.books).filter((b) => b?.cover_i) ?? [],
    [data]
  );

  const booksRef = useRef(books);

  useEffect(() => {
    booksRef.current = books;
  }, [books]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems.length) return;

      setCurrentIndex(viewableItems[0].index ?? 0);

      const idx = viewableItems[0].index ?? 0;
      const allBooks = booksRef.current;

      for (let i = 1; i <= 3; i++) {
        const next = allBooks[idx + i];
        if (next?.cover_i) {
          Image.prefetch(
            `https://covers.openlibrary.org/b/id/${next.cover_i}-L.jpg`
          );
        }
      }
    }
  ).current;

  if (isLoading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ height: SLIDE_HEIGHT }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleLike = () => {
    Toast.success("Лайк", "top");
    scrollTo(currentIndex + 1);
  };

  const handleNope = () => {
    Toast.error("Неподходящая книга", "top");
    scrollTo(currentIndex + 1);
  };

  const renderItem = ({ item }: { item: IBook }) => {
    return (
      <SwipeableBookCard
        key={item.key}
        item={item}
        onLike={handleLike}
        onNope={handleNope}
      />
    );
  };

  const renderListFooterComponent = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <ActivityIndicator size="small" />
        </View>
      );
    }
    return null;
  };

  const renderListEmptyComponent = () => {
    return (
      <View
        style={{ height: SLIDE_HEIGHT }}
        className="flex-1 justify-center items-center px-4"
      >
        <Text className="text-zinc-300 text-center text-[24px]">
          Нет книг для отображения. Попробуйте потянуть для обновления
        </Text>
      </View>
    );
  };

  const getItemLayout = (_: any, index: number) => ({
    length: SLIDE_HEIGHT,
    offset: SLIDE_HEIGHT * index,
    index,
  });

  // защита onEndReached
  const handleEndReached = () => {
    if (!onEndReachedCalled.current && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
      onEndReachedCalled.current = true;
    }
  };

  // сбрасываем флаг, когда начинается очередная прокрутка
  const handleMomentumScrollBegin = () => {
    onEndReachedCalled.current = false;
  };

  // если по каким-то причинам нас «пришвырнуло» дальше последней книги,
  // то плавно скроллим до последнего нормального индекса
  const handleMomentumScrollEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / SLIDE_HEIGHT);
    const lastIdx = books.length - 1;
    if (idx > lastIdx) {
      flatListRef.current?.scrollToOffset({
        offset: lastIdx * SLIDE_HEIGHT,
        animated: true,
      });
    }
  };

  return (
    <FlatList
      ref={flatListRef}
      data={books}
      keyExtractor={(item, idx) => `${item.cover_i}-${idx}`}
      // вот это гарантирует: стартуем всегда с нулевой страницы
      initialScrollIndex={0}
      getItemLayout={getItemLayout}
      // снэп по экрану
      snapToInterval={SLIDE_HEIGHT}
      snapToAlignment="start"
      disableIntervalMomentum
      decelerationRate="fast"
      // infinite-scroll-хуки
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onMomentumScrollBegin={handleMomentumScrollBegin}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      onViewableItemsChanged={onViewableItemsChanged}
      renderItem={renderItem}
      ListFooterComponent={renderListFooterComponent}
      ListEmptyComponent={renderListEmptyComponent}
    />
  );
};
