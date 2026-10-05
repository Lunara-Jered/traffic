import { create } from "zustand";
import { persist } from "zustand/middleware";

type WatchlistState = {
  titles: string[];
  toggle: (title: string) => void;
  has: (title: string) => boolean;
};

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      titles: [],
      toggle: (title) => set((state) => ({ titles: state.titles.includes(title) ? state.titles.filter((item) => item !== title) : [...state.titles, title] })),
      has: (title) => get().titles.includes(title),
    }),
    { name: "streamflix-watchlist", skipHydration: true },
  ),
);