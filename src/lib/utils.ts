import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  const endDate = new Date(today);
  const startDate = new Date(today);

  switch (period) {
    case "today":
      break;
    case "yesterday":
      startDate.setDate(today.getDate() - 1);
      endDate.setDate(today.getDate() - 1);
      break;
    case "seven-days":
      startDate.setDate(today.getDate() - 6);
      break;
    case "fifteen-days":
      startDate.setDate(today.getDate() - 14);
      break;
    case "month":
      startDate.setDate(today.getDate() - 29);
      break;
    case "year":
      startDate.setDate(today.getDate() - 364);
      break;
    default:
      startDate.setDate(today.getDate() - 364);
  }

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}
