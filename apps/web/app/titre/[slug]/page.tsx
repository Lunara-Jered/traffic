import Link from "next/link";
import { WatchlistButton } from "@/components/watchlist-button";

type TitleEntry = { title: string; type: string; year: string; rating: string; genre: string; duration: string; image: string; synopsis: string; cast: string; episodes: readonly string[] };

const entries: Record<string, TitleEntry> = {
  "dune-deuxieme-partie": { title: "Dune : Deuxième partie", type: "Film", year: "2024", rating: "8.5", genre: "Science-fiction · Aventure", duration: "166 min", image: "photo-1500530855697-b586d89ba3ee", synopsis: "Sur Arrakis, Paul Atréides rejoint les Fremen et doit choisir entre son amour et le destin d’un peuple qui voit en lui son messie.", cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson", episodes: [] },
  "terre-promise": { title: "Terre promise", type: "Mini-série", year: "2025", rating: "8.4", genre: "Aventure · Drame", duration: "4 épisodes", image: "photo-1470770841072-f978cf4d019e", synopsis: "Au bout de la route, une famille découvre un monde intact et les secrets qui l’ont protégé. Une aventure qui redonne envie de tout recommencer.", cast: "Adèle Martin, Noé Bernard, Inès Diallo", episodes: ["Le premier pas", "Ce que la forêt garde", "La ligne des crêtes", "Un endroit à soi"] },
  "mers-profondes": { title: "Mers profondes", type: "Documentaire", year: "2025", rating: "9.1", genre: "Nature · Exploration", duration: "92 min", image: "photo-1518837695005-2083093ee35b", synopsis: "Une expédition aux confins de l’océan révèle un écosystème aussi fragile qu’extraordinaire.", cast: "Léa Garnier, Karim Morel", episodes: [] },
  "lumiere-du-nord": { title: "Lumière du Nord", type: "Série", year: "2025", rating: "8.3", genre: "Drame · Mystère", duration: "6 épisodes", image: "photo-1531366936337-7c912a4589a7", synopsis: "Quand la nuit polaire s’installe, une petite communauté découvre que ses secrets brillent plus fort que les aurores.", cast: "Mila Laurent, Élias Petit, Zoé Fontaine", episodes: ["La longue nuit", "Le village des phares", "La vallée blanche", "Une trace dans la neige"] },
};

export default async function TitlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = entries[slug] ?? {
    title: slug.split("-").map((part) => part.charAt(0).toLocaleUpperCase("fr") + part.slice(1)).join(" "),
    type: "Film · Sélection", year: "2025", rating: "8.0", genre: "À découvrir", duration: "Catalogue", image: "photo-1500530855697-b586d89ba3ee",
    synopsis: "Cette fiche éditoriale est un exemple de catalogue. Les informations et les droits de diffusion doivent être fournis par l’éditeur de contenu.",
    cast: "Informations de distribution à confirmer", episodes: [],
  };

  return (
    <main className="title-page" style={{ "--title-image": `url(https://images.unsplash.com/${title.image}?auto=format&fit=crop&w=2000&q=85)` } as React.CSSProperties}>
      <header className="site-header"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><nav className="nav-links"><Link href="/">Accueil</Link><Link href="/catalogue">Films & séries</Link><Link href="/direct">En direct</Link></nav><div className="header-actions"><Link href="/compte">Mon compte</Link></div></header>
      <section className="title-hero"><div className="title-copy"><Link className="back-link" href="/catalogue">← Catalogue</Link><div className="eyebrow">{title.type} · Sélection StreamFlix</div><h1 className="display">{title.title}</h1><div className="hero-meta"><span>{title.year}</span><span>{title.duration}</span><span>{title.genre}</span><span className="rating">★ {title.rating}</span></div><p className="hero-copy">{title.synopsis}</p><div className="hero-buttons"><Link className="button button-primary" href="/watch/demo"><span aria-hidden="true">▶</span> Voir la démo du lecteur</Link><WatchlistButton title={title.title} /></div><p className="rights-note">Fiche éditoriale de démonstration. Le lecteur utilise un flux de test public, pas le programme présenté ici.</p></div></section>
      <section className="title-information"><div><span className="detail-label">Distribution</span><p>{title.cast}</p></div><div><span className="detail-label">À propos</span><p>{title.synopsis}</p></div></section>
      {title.episodes.length > 0 && <section className="content-section episode-section"><div className="section-heading"><h2>Épisodes · Saison 1</h2><span className="section-subtitle">{title.episodes.length} épisodes</span></div><div className="episode-list">{title.episodes.map((episode, index) => <Link className="episode-row" href="/watch/demo" key={episode}><span className="episode-number">{String(index + 1).padStart(2, "0")}</span><span className="episode-name">{episode}<small>Épisode de démonstration · 42 min</small></span><span aria-hidden="true">▶</span></Link>)}</div></section>}
      <footer className="site-footer"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><span>Fiche de contenu non contractuelle · Lecture de démonstration uniquement.</span><span>© 2025 StreamFlix</span></footer>
    </main>
  );
}