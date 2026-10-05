import Link from "next/link";

const channels = [
  { name: "Le direct", category: "Actualités", image: "photo-1504711434969-e33886168f5c", programs: [["18:00", "Le journal du soir"], ["19:00", "Regards croisés"], ["20:00", "Le grand débat"]] },
  { name: "Stade 24", category: "Sport", image: "photo-1461896836934-ffe607ba8211", programs: [["18:00", "Le magazine du sport"], ["19:30", "En piste"], ["21:00", "Les grands matchs"]] },
  { name: "Cuisine ouverte", category: "Art de vivre", image: "photo-1547592180-85f173990554", programs: [["18:15", "Les marchés d’ici"], ["19:15", "À table !"], ["20:15", "La cuisine du monde"]] },
  { name: "Planète sauvage", category: "Documentaire", image: "photo-1470770841072-f978cf4d019e", programs: [["18:00", "Les forêts anciennes"], ["19:00", "Au bord des lacs"], ["20:00", "Terres vivantes"]] },
];

export default function LiveGuidePage() {
  return (
    <main>
      <header className="site-header"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><nav className="nav-links"><Link href="/">Accueil</Link><Link href="/catalogue">Films & séries</Link><Link href="/direct">En direct</Link></nav><div className="header-actions"><Link href="/compte">Mon compte</Link></div></header>
      <section className="page-header"><div className="eyebrow"><span className="live-dot" /> Grille éditoriale fictive</div><h1>Le direct, à votre rythme</h1><p className="hero-copy">Un aperçu du guide. Les chaînes et horaires ci-dessous sont des données de démonstration, sans diffusion associée.</p></section>
      <section className="epg-section" aria-label="Grille de programmes">
        <div className="epg-timebar"><span>Chaîne</span><span>18:00</span><span>19:00</span><span>20:00</span><span>21:00</span></div>
        {channels.map((channel) => <article className="epg-channel" key={channel.name}><div className="epg-channel-name"><img src={`https://images.unsplash.com/${channel.image}?auto=format&fit=crop&w=240&q=70`} alt="" /><span><strong>{channel.name}</strong><small>{channel.category}</small></span></div><div className="epg-programs">{channel.programs.map(([time, name], index) => <div className={`epg-program ${index === 1 ? "epg-current" : ""}`} key={time}><small>{time}</small><strong>{name}</strong>{index === 1 && <span className="epg-progress"><i /></span>}</div>)}</div></article>)}
      </section>
      <p className="epg-note">Aucune chaîne réelle n’est diffusée par cette démonstration. Les flux en direct nécessitent des droits de diffusion et une source autorisée.</p>
      <footer className="site-footer"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><span>Guide TV de démonstration</span><span>© 2025 StreamFlix</span></footer>
    </main>
  );
}