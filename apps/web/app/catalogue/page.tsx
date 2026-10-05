"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { slugify } from "@/lib/slug";

const titles = [
  { title: "Terre promise", year: 2025, genre: "Aventure", rating: 8.4, type: "Série", image: "photo-1470770841072-f978cf4d019e" },
  { title: "Dune : Deuxième partie", year: 2024, genre: "Science-fiction", rating: 8.5, type: "Film", image: "photo-1500530855697-b586d89ba3ee" },
  { title: "Le Grand Bleu", year: 2023, genre: "Aventure", rating: 8.1, type: "Film", image: "photo-1518837695005-2083093ee35b" },
  { title: "Les Ombres", year: 2025, genre: "Thriller", rating: 7.9, type: "Série", image: "photo-1519608487953-e999c86e7455" },
  { title: "Terre Sauvage", year: 2024, genre: "Documentaire", rating: 9.0, type: "Film", image: "photo-1470770841072-f978cf4d019e" },
  { title: "Dernier Horizon", year: 2025, genre: "Drame", rating: 7.8, type: "Film", image: "photo-1464822759023-fed622ff2c3b" },
  { title: "Au bout du monde", year: 2025, genre: "Aventure", rating: 8.4, type: "Film", image: "photo-1500534623283-312aade485b7" },
  { title: "Ligne de fuite", year: 2025, genre: "Thriller", rating: 8.0, type: "Série", image: "photo-1480714378408-67cf0d13bc1b" },
  { title: "Mers profondes", year: 2025, genre: "Documentaire", rating: 9.1, type: "Film", image: "photo-1518837695005-2083093ee35b" },
  { title: "Lumière du Nord", year: 2025, genre: "Drame", rating: 8.3, type: "Série", image: "photo-1531366936337-7c912a4589a7" },
  { title: "Wild State", year: 2025, genre: "Documentaire", rating: 8.7, type: "Série", image: "photo-1470770841072-f978cf4d019e" },
  { title: "Nuit Blanche", year: 2024, genre: "Policier", rating: 8.2, type: "Film", image: "photo-1519608487953-e999c86e7455" },
];

const genres = [...new Set(titles.map((title) => title.genre))];

export default function CataloguePage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("Tous les genres");
  const [type, setType] = useState("Tout");
  const [minimumRating, setMinimumRating] = useState("0");
  const [visibleCount, setVisibleCount] = useState(8);
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("fr"));
  useEffect(() => {
    const requestedType = new URLSearchParams(window.location.search).get("type");
    if (requestedType === "series") setType("Série");
    if (requestedType === "movie") setType("Film");
  }, []);
  const results = titles.filter((item) =>
    item.title.toLocaleLowerCase("fr").includes(deferredSearch)
    && (genre === "Tous les genres" || item.genre === genre)
    && (type === "Tout" || item.type === type)
    && item.rating >= Number(minimumRating),
  );

  return (
    <main>
      <header className="site-header"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><nav className="nav-links" aria-label="Navigation principale"><Link href="/">Accueil</Link><Link href="/catalogue">Films & séries</Link></nav><div className="header-actions"><Link href="/catalogue">Explorer</Link></div></header>
      <section className="page-header"><div className="eyebrow">La collection StreamFlix</div><h1>Trouvez votre prochain coup de cœur</h1><p className="hero-copy">Des films qui font voyager, des séries qui nous tiennent éveillés.</p></section>
      <div className="catalogue-layout">
        <aside className="catalogue-filters" aria-label="Filtres du catalogue">
          <div className="search-wrap"><label htmlFor="catalogue-search" className="filter-group"><strong>Recherche</strong><input className="catalogue-search" id="catalogue-search" type="search" placeholder="Un titre, un univers…" value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(8); }} /></label></div>
          <div className="filter-group"><h3>Format</h3>{["Tout", "Film", "Série"].map((option) => <label key={option}><input type="radio" name="type" checked={type === option} onChange={() => { setType(option); setVisibleCount(8); }} /> {option}</label>)}</div>
          <div className="filter-group"><label htmlFor="genre-select"><strong>Genre</strong></label><select id="genre-select" className="catalogue-search" value={genre} onChange={(event) => { setGenre(event.target.value); setVisibleCount(8); }}><option>Tous les genres</option>{genres.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="filter-group"><label htmlFor="rating-select"><strong>Note minimale</strong></label><select id="rating-select" className="catalogue-search" value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)}><option value="0">Toutes les notes</option><option value="8">8 et plus</option><option value="8.5">8,5 et plus</option><option value="9">9 et plus</option></select></div>
        </aside>
        <section aria-label="Résultats du catalogue"><p className="catalogue-count">{results.length} {results.length === 1 ? "titre disponible" : "titres disponibles"}</p>{results.length ? <><div className="catalogue-grid">{results.slice(0, visibleCount).map((item) => <Link className="movie-card" href={`/titre/${slugify(item.title)}`} key={item.title}><div className="movie-poster"><img src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=600&q=80`} alt="" /><div className="poster-shade" /><span className="kind-tag">{item.type}</span><div className="movie-info"><p className="movie-title">{item.title}</p><div className="movie-details"><span>{item.year}</span><span>{item.genre}</span><span className="rating">★ {item.rating}</span></div></div></div></Link>)}</div>{visibleCount < results.length && <button className="button button-secondary" type="button" onClick={() => setVisibleCount((count) => count + 8)}>Afficher plus</button>}</> : <p className="empty-state">Aucun titre ne correspond à ces filtres. Essayez une autre recherche.</p>}</section>
      </div>
      <footer className="site-footer"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><span>Une bibliothèque de contenus de démonstration.</span><span>© 2025 StreamFlix · Mentions légales · Confidentialité</span></footer>
    </main>
  );
}