import { Geist, Geist_Mono, Fraunces, Source_Sans_3, Gabarito } from "next/font/google";
import "./globals.css";
import CursorFollower from "@/components/cursor-follower";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
// Fraunces ya forma parte del diseño; cargarla evita que el menú termine
// mostrando solo su fallback Georgia aunque el token esté definido.
const fraunces = Fraunces({ variable: "--font-loaded-serif", subsets: ["latin"], display: "swap" });
const sourceSans = Source_Sans_3({ variable: "--font-loaded-body", subsets: ["latin"], display: "swap" });
const gabarito = Gabarito({ variable: "--font-loaded-display", subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Quokka Studio · Portfolio en pruebas",
  description: "Portfolio del equipo de Lenguajes IV: desarrollo fullstack, diseño e interacción.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${sourceSans.variable} ${gabarito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CursorFollower />
      </body>
    </html>
  );
}
