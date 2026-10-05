import { VideoPlayer } from "@/components/video-player";

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <VideoPlayer title={slug === "demo" ? "Flux HLS de démonstration" : decodeURIComponent(slug)} />;
}