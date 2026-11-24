import type { Metadata, Viewport } from "next";
import { Chivo_Mono, Jersey_10 } from "next/font/google";
import { RetroShell } from "@/components/retro/RetroShell";
import { SITE } from "@/content/site";
import { GAME_NAME } from "@/lib/brand";
import "./globals.css";

/* Fuentes abiertas (SIL Open Font License 1.1), autoalojadas por next/font. */
const display = Jersey_10({
  variable: "--font-jersey",
  weight: "400",
  subsets: ["latin", "latin-ext"],
  fallback: ["Courier New", "monospace"],
});

const mono = Chivo_Mono({
  variable: "--font-chivo",
  weight: ["400", "500", "700"],
  subsets: ["latin", "latin-ext"],
  fallback: ["ui-monospace", "Menlo", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: {
    default: GAME_NAME,
    template: `%s · ${GAME_NAME}`,
  },
  description: SITE.tagline,
  applicationName: GAME_NAME,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020b14",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${mono.variable}`}>
      <body>
        <noscript>
          <style>{`.screen__boot{display:none}`}</style>
        </noscript>
        <RetroShell>{children}</RetroShell>
      </body>
    </html>
  );
}
