import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const twClsx = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
