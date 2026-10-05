"use client";

import { useWatchlist } from "@/lib/watchlist";

export function WatchlistButton({ title }: { title: string }) {
  const saved = useWatchlist((state) => state.titles.includes(title));
  const toggle = useWatchlist((state) => state.toggle);
  return <button className="button button-secondary" type="button" aria-pressed={saved} onClick={() => toggle(title)}><span aria-hidden="true">{saved ? "✓" : "＋"}</span>{saved ? "Dans ma liste" : "Ma liste"}</button>;
}