import type { Metadata } from "next";
import { Space_Grotesk, UnifrakturCook } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const unifraktur = UnifrakturCook({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-unifraktur",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
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
      <body className={`${spaceGrotesk.variable} ${unifraktur.variable} antialiased font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
