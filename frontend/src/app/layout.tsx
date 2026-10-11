import type { Metadata } from "next";
import {
  Fraunces,
  Gabarito,
  IBM_Plex_Mono,
  Source_Sans_3,
} from "next/font/google";
import "./globals.css";

// DESIGN.md §4.1 — each family is loaded centrally via next/font/google and
// exposed under a dedicated CSS variable. The canonical role tokens
// (--font-display/body/mono/serif) are mapped to these variables in
// src/app/globals.css.
const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  // Static font family: next/font requires an explicit weight list.
  // 400 for mono body, 600–700 for labels/indices (DESIGN.md §4.2).
  weight: ["400", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quokka Studio",
  description:
    "Quokka Studio: diseño y desarrollo de experiencias web.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${gabarito.variable} ${sourceSans3.variable} ${ibmPlexMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
