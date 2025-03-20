import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import webpush from "web-push";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
