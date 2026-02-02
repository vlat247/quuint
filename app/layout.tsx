import type { Metadata } from "next";
import { Markazi_Text, UnifrakturCook } from "next/font/google";
import "./globals.css";

export const unifraktur = UnifrakturCook({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

const markaziText = Markazi_Text({
  variable: "--font-markazi",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "quint — AI-powered Telegram summaries",
  description:
    "Turn Telegram chaos into clear, structured knowledge. AI-powered summaries, relevance scoring, and semantic search for your Telegram channels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${markaziText.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
