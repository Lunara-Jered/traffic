"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { WatchlistButton } from "@/components/watchlist-button";

const features = [
  { title: <>Terre<br />promise</>, key: "Terre promise", eyebrow: "StreamFlix présente · Événement", year: "2025", format: "Mini-série", episodes: "4 épisodes", quality: "4K UHD", description: "Au bout de la route, une famille découvre un monde intact et les secrets qui l’ont protégé. Une aventure qui redonne envie de tout recommencer.", image: "photo-1470770841072-f978cf4d019e", alt: "Lac de montagne au coucher du soleil" },
  { title: <>Mers<br />profondes</>, key: "Mers profondes", eyebrow: "Documentaire · Nouveau", year: "2025", format: "Documentaire", episodes: "92 min", quality: "4K UHD", description: "Une expédition aux confins de l’océan révèle un écosystème aussi fragile qu’extraordinaire.", image: "photo-1518837695005-2083093ee35b", alt: "Houle océanique au large" },
  { title: <>Lumière<br />du nord</>, key: "Lumière du Nord", eyebrow: "Série · Saison 1", year: "2025", format: "Série", episodes: "6 épisodes", quality: "4K UHD", description: "Quand la nuit polaire s’installe, une petite communauté découvre que ses secrets brillent plus fort que les aurores.", image: "photo-1531366936337-7c912a4589a7", alt: "Aurore boréale dans la nuit" },
];

export function FeaturedCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const feature = features[active];

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % features.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  return (
    <section className="hero" aria-label="À la une" aria-roledescription="carrousel">
      <AnimatePresence mode="wait">
        <motion.img key={feature.image} className="hero-image" src={`https://images.unsplash.com/${feature.image}?auto=format&fit=crop&w=2200&q=90`} alt={feature.alt} initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.025 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.7 }} />
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div className="hero-content" key={feature.key} initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }} transition={{ duration: reduceMotion ? 0 : 0.35 }}>
          <div className="eyebrow">{feature.eyebrow}</div><h1 className="display">{feature.title}</h1>
          <div className="hero-meta"><span>{feature.year}</span><span>{feature.format}</span><span>{feature.episodes}</span><span>{feature.quality}</span></div>
          <p className="hero-copy">{feature.description}</p>
          <div className="hero-buttons"><Link className="button button-primary" href="/watch/demo"><span aria-hidden="true">▶</span> Lancer la lecture</Link><WatchlistButton title={feature.key} /></div>
        </motion.div>
      </AnimatePresence>
      <div className="hero-index" aria-label={`Titre ${active + 1} sur ${features.length}`}>
        {features.map((item, index) => <button className={index === active ? "active" : ""} type="button" key={item.key} aria-label={`Afficher ${item.key}`} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)} />)}
        <button className="carousel-pause" type="button" aria-label={paused ? "Reprendre le carrousel" : "Mettre le carrousel en pause"} onClick={() => setPaused(!paused)}>{paused ? "▶" : "Ⅱ"}</button>
      </div>
    </section>
  );
}