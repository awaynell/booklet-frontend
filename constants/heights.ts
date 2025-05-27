import { Dimensions } from "react-native";

export const TAB_BAR_HEIGHT = 45.7;

const { height: SCREEN_HEIGHT } = Dimensions.get("screen");
export const SLIDE_HEIGHT = Math.round(SCREEN_HEIGHT - TAB_BAR_HEIGHT);
