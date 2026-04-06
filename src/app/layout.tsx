import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hit Star | Distribución Digital de Música",
  description:
    "Distribuye tu música a Spotify, Apple Music, YouTube, TikTok y más plataformas desde un único panel profesional.",
  keywords: [
    "distribución musical",
    "subir música a Spotify",
    "distribuidora digital",
    "royalties musicales",
    "Hit Star",
  ],

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  openGraph: {
    title: "Hit Star Digital Distributor",
    description:
      "Distribuye tu música globalmente y gestiona tus royalties desde un único panel.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}