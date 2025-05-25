import { useBooks } from "@/api/books/hooks";
import { BookSlideItem } from "@/components/molecules/BookSlide";
import { IBook } from "@/types/books";
import React, { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  View,
  ViewToken,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

export const BookSlider = () => {
  const flatListRef = useRef<FlatList>(null);
  const onEndReachedCalled = useRef(false);

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
    () => data?.pages.flatMap((p) => p.books).filter((b) => b.cover_i) ?? [],
    [data]
  );
  console.log("books", books);

  // Предзагрузка первых трёх обложек
  useMemo(() => {
    books
      .slice(0, 3)
      .forEach((b) =>
        Image.prefetch(`https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`)
      );
  }, [books]);

  // Предзагрузка следующих обложек при показе новых
  const onViewableItemsChanged = React.useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems.length) return;
      const idx = viewableItems[0].index ?? 0;
      for (let i = 1; i <= 3; i++) {
        const next = books[idx + i];
        if (next) {
          Image.prefetch(
            `https://covers.openlibrary.org/b/id/${next.cover_i}-L.jpg`
          );
        }
      }
    },
    [books]
  );

  if (isLoading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ height: SCREEN_HEIGHT }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: IBook }) => {
    return <BookSlideItem item={item} />;
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

  const getItemLayout = (_: any, index: number) => ({
    length: SCREEN_HEIGHT,
    offset: SCREEN_HEIGHT * index,
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
    const idx = Math.round(offsetY / SCREEN_HEIGHT);
    const lastIdx = books.length - 1;
    if (idx > lastIdx) {
      flatListRef.current?.scrollToOffset({
        offset: lastIdx * SCREEN_HEIGHT,
        animated: true,
      });
    }
  };

  return (
    <FlatList
      ref={flatListRef}
      data={books}
      renderItem={renderItem}
      keyExtractor={(item, idx) => `${item.cover_i}-${idx}`}
      // вот это гарантирует: стартуем всегда с нулевой страницы
      initialScrollIndex={0}
      getItemLayout={getItemLayout}
      // снэп по экрану
      snapToInterval={SCREEN_HEIGHT}
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
      ListFooterComponent={renderListFooterComponent}
    />
  );
};
