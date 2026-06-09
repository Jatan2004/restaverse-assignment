import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getAvatarColors(department) {
  switch (department) {
    case "Engineering":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
      };
    case "Marketing":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
      };
    case "Human Resources":
      return {
        bg: "bg-green-500/10 dark:bg-green-500/20",
        text: "text-green-600 dark:text-green-400",
      };
    case "Finance":
      return {
        bg: "bg-slate-500/10 dark:bg-slate-500/20",
        text: "text-slate-600 dark:text-slate-400",
      };
    case "Sales":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
      };
    default:
      return {
        bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
        text: "text-zinc-600 dark:text-zinc-400",
      };
  }
}
