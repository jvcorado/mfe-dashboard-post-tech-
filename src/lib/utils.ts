import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, subDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeString(str: string) {
  if (!str) return "";

  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getDateRange(
  period:
    | "today"
    | "yesterday"
    | "seven-days"
    | "fifteen-days"
    | "month"
    | "year"
): { startDate: string; endDate: string } {
  const today = new Date();
  let start = today;
  let end = today;

  switch (period) {
    case "today":
      break;

    case "yesterday":
      start = subDays(today, 1);
      end = subDays(today, 1);
      break;

    case "seven-days":
      start = subDays(today, 6);
      break;

    case "fifteen-days":
      start = subDays(today, 14);
      break;

    case "month":
      start = subDays(today, 29);
      break;

    case "year":
      start = subDays(today, 364);
      break;

    default:
      start = subDays(today, 364);
  }

  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
}


