import type { Metadata } from "next";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreamFlix — Histoires hors du commun",
  description: "Films, séries et télévision en direct. Trouvez votre prochaine histoire.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body><QueryProvider>{children}</QueryProvider></body>
    </html>
  );
}