import { Figtree, DM_Mono, Gabarito } from "next/font/google";
import "./globals.css";
import { AppearanceProvider } from "@/hooks/use-appearance";
import QuokkaEffects from "@/components/layout/quokka-effects";
import NavigationTransition from "@/components/navigation/navigation-transition";
import CursorFollower from "@/components/layout/cursor-follower";

const figtree = Figtree({ variable: "--font-loaded-body", subsets: ["latin"], display: "swap" });
const dmMono = DM_Mono({ variable: "--font-loaded-mono", weight: ["400", "500"], subsets: ["latin"], display: "swap" });
const gabarito = Gabarito({ variable: "--font-loaded-display", subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Quokka Studio · Código con instinto",
  description: "Portfolio del equipo de Lenguajes IV: desarrollo fullstack, diseño e interacción.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      data-pal="sonrisa"
      data-theme="light"
      className={`${figtree.variable} ${dmMono.variable} ${gabarito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppearanceProvider>
        {children}
        <NavigationTransition />
        <QuokkaEffects />
        <CursorFollower />
        </AppearanceProvider>
      </body>
    </html>
  );
}
