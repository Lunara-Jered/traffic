"use client";

import Hls from "hls.js";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const DEMO_STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export function VideoPlayer({ title = "Flux de démonstration" }: { title?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState(-1);
  const [levels, setLevels] = useState<{ height: number; index: number }[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<{ label: string; index: number }[]>([]);
  const [subtitleTrack, setSubtitleTrack] = useState(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | undefined;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = DEMO_STREAM;
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(DEMO_STREAM);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setLevels(data.levels.map((level, index) => ({ height: level.height, index })));
        setSubtitleTracks(hls?.subtitleTracks.map((_track, index) => ({ label: `Sous-titres ${index + 1}`, index })) ?? []);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => setQuality(data.level));
      hlsRef.current = hls;
    }

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime > 0) window.localStorage.setItem("streamflix-progress-demo", String(video.currentTime));
    };
    const updateDuration = () => {
      setDuration(video.duration || 0);
      const position = Number(window.localStorage.getItem("streamflix-progress-demo"));
      if (position > 5 && position < video.duration - 10) video.currentTime = position;
    };
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      hlsRef.current = null;
      hls?.destroy();
    };
  }, []);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play();
    else video.pause();
    setPlaying(!video.paused);
  };

  return (
    <main className="watch-shell">
      <header className="watch-top"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><Link href="/catalogue">← Catalogue</Link></header>
      <div className="video-frame">
        <video ref={videoRef} playsInline preload="metadata" aria-label={`Lecteur vidéo : ${title}`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
        {!playing && <button className="player-center" type="button" aria-label="Lire la vidéo" onClick={togglePlayback}>▶</button>}
        <div className="player-controls" aria-label="Commandes du lecteur">
          <button type="button" aria-label={playing ? "Mettre en pause" : "Lire"} onClick={togglePlayback}>{playing ? "Ⅱ" : "▶"}</button>
          <button type="button" aria-label={muted ? "Activer le son" : "Couper le son"} onClick={() => { const video = videoRef.current; if (video) { video.muted = !video.muted; setMuted(video.muted); } }}>{muted ? "⌁" : "◖"}</button>
          <input aria-label="Volume" type="range" min="0" max="1" step="0.05" defaultValue="1" onChange={(event) => { if (videoRef.current) videoRef.current.volume = Number(event.target.value); }} />
          <span className="player-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <label className="quality-control">Qualité <select aria-label="Qualité vidéo" value={quality} onChange={(event) => { const index = Number(event.target.value); setQuality(index); if (hlsRef.current) hlsRef.current.currentLevel = index; }}><option value={-1}>Auto</option>{levels.map((level) => <option key={level.index} value={level.index}>{level.height}p</option>)}</select></label>
          {subtitleTracks.length > 0 && <label className="quality-control">Sous-titres <select aria-label="Sous-titres" value={subtitleTrack} onChange={(event) => { const index = Number(event.target.value); setSubtitleTrack(index); if (hlsRef.current) hlsRef.current.subtitleTrack = index; }}><option value={-1}>Désactivés</option>{subtitleTracks.map((track) => <option key={track.index} value={track.index}>{track.label}</option>)}</select></label>}
          <button type="button" aria-label="Picture dans l’image" onClick={() => { const video = videoRef.current; if (video && document.pictureInPictureEnabled) void video.requestPictureInPicture(); }}>▣</button>
          <button type="button" aria-label="Plein écran" onClick={() => { const frame = videoRef.current?.parentElement; if (frame?.requestFullscreen) void frame.requestFullscreen(); }}>⛶</button>
        </div>
      </div>
      <section className="watch-caption"><span className="eyebrow">Démo lecteur · Flux de test public</span><h1>{title}</h1><p>Ce lecteur utilise un flux HLS public de démonstration. En production, remplacez cette source par une URL CDN signée, liée à une session et à un contenu dont vous détenez les droits.</p></section>
    </main>
  );
}