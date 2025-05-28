import { SLIDE_HEIGHT } from "@/constants/heights";
import { IBook } from "@/types/books";
import { FC } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BookSlideItem } from ".";

const SWIPE_THRESHOLD = 120; // px

type Props = {
  item: IBook;
  onLike: (item: IBook) => void;
  onNope: (item: IBook) => void;
};

const EXIT_DURATION = 180; // мс

export const SwipeableBookCard: FC<Props> = ({ item, onLike, onNope }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // угол поворота ±15°
  const rotateZ = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15]) // ≥15 px по X — захватываем жест
    .failOffsetY([-10, 10]) // >10 px по Y — отдаём скроллу

    .onUpdate(({ translationX, translationY }) => {
      translateX.value = translationX;
      translateY.value = translationY;
      rotateZ.value = translationX / 20; // лёгкий наклон
    })

    .onEnd(({ velocityX }) => {
      const toRight = translateX.value > SWIPE_THRESHOLD;
      const toLeft = translateX.value < -SWIPE_THRESHOLD;

      if (toRight || toLeft) {
        runOnJS(toRight ? onLike : onNope)(item);

        const destX = (toRight ? 1 : -1) * 2 * SLIDE_HEIGHT;
        translateX.value = withTiming(destX, { duration: EXIT_DURATION });
      } else {
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        rotateZ.value = withTiming(0, { duration: 200 });
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ height: SLIDE_HEIGHT }, cardStyle]}>
        <BookSlideItem item={item} />
      </Animated.View>
    </GestureDetector>
  );
};
