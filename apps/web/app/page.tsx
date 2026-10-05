import Link from "next/link";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { slugify } from "@/lib/slug";

const collections = [
  {
    title: "Les plus regardés",
    items: [
      { title: "Dune : Deuxième partie", year: "2024", genre: "Science-fiction", rating: "8.5", image: "photo-1500530855697-b586d89ba3ee" },
      { title: "Le Grand Bleu", year: "2023", genre: "Aventure", rating: "8.1", image: "photo-1518837695005-2083093ee35b" },
      { title: "Les Ombres", year: "2025", genre: "Thriller", rating: "7.9", image: "photo-1519608487953-e999c86e7455" },
      { title: "Terre Sauvage", year: "2024", genre: "Documentaire", rating: "9.0", image: "photo-1470770841072-f978cf4d019e" },
      { title: "Dernier Horizon", year: "2025", genre: "Drame", rating: "7.8", image: "photo-1464822759023-fed622ff2c3b" },
      { title: "Nuit Blanche", year: "2024", genre: "Policier", rating: "8.2", image: "photo-1519608487953-e999c86e7455" },
    ],
  },
  {
    title: "Fraîchement arrivés",
    items: [
      { title: "Au bout du monde", year: "2025", genre: "Aventure", rating: "8.4", image: "photo-1500534623283-312aade485b7" },
      { title: "Ligne de fuite", year: "2025", genre: "Thriller", rating: "8.0", image: "photo-1480714378408-67cf0d13bc1b" },
      { title: "Mers profondes", year: "2025", genre: "Documentaire", rating: "9.1", image: "photo-1518837695005-2083093ee35b" },
      { title: "Lumière du Nord", year: "2025", genre: "Drame", rating: "8.3", image: "photo-1531366936337-7c912a4589a7" },
      { title: "Wild State", year: "2025", genre: "Série · 1 saison", rating: "8.7", image: "photo-1470770841072-f978cf4d019e" },
    ],
  },
];

function FilmCard({ item }: { item: (typeof collections)[number]["items"][number] }) {
  return (
    <Link className="movie-card" href={`/titre/${slugify(item.title)}`}>
      <div className="movie-poster">
        <img src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=600&q=80`} alt="" />
        <div className="poster-shade" />
        <div className="movie-info"><p className="movie-title">{item.title}</p><div className="movie-details"><span>{item.year}</span><span>{item.genre}</span><span className="rating">★ {item.rating}</span></div></div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/">STREAM<span>FLIX</span></Link>
        <nav className="nav-links" aria-label="Navigation principale"><Link href="/">Accueil</Link><Link href="/catalogue">Films & séries</Link><Link href="/direct">En direct</Link><Link href="/catalogue?type=series">Séries</Link></nav>
        <div className="header-actions"><span>Explorer</span><Link className="header-icon" href="/catalogue" aria-label="Rechercher">⌕</Link><Link href="/compte">Mon compte</Link></div>
      </header>
      <FeaturedCarousel />
      {collections.map((collection) => <section className="content-section" key={collection.title}><div className="section-heading"><h2>{collection.title}</h2><Link href="/catalogue">Tout voir&nbsp; ↗</Link></div><div className="movie-row">{collection.items.map((item) => <FilmCard key={item.title} item={item} />)}</div></section>)}
      <section className="content-section"><div className="section-heading"><h2><span className="live-dot" /> En direct maintenant</h2><Link href="/direct">Guide TV&nbsp; ↗</Link></div><div className="movie-row">{["Le direct — Actualités", "Grand Prix — Sport", "La cuisine du monde", "Planète sauvage"].map((name, i) => <Link className="movie-card" href="/direct" key={name}><div className="movie-poster"><img src={`https://images.unsplash.com/${["photo-1504711434969-e33886168f5c", "photo-1461896836934-ffe607ba8211", "photo-1547592180-85f173990554", "photo-1470770841072-f978cf4d019e"][i]}?auto=format&fit=crop&w=600&q=80`} alt="" /><div className="poster-shade" /><span className="kind-tag"><span className="live-dot" /> Démo EPG</span><div className="movie-info"><p className="movie-title">{name}</p><div className="movie-details"><span>Guide de démonstration</span></div></div></div></Link>)}</div></section>
      <footer className="site-footer"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><span>Films, séries et directs. Les histoires nous rapprochent.</span><span><Link href="/signalement">Signaler un contenu</Link> · © 2025 StreamFlix</span></footer>
    </main>
  );
}