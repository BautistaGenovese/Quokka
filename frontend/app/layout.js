import { Figtree, DM_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AppearanceProvider } from "@/hooks/use-apariencia";
import QuokkaEffects from "@/components/layout/efectos-quokka";
import NavigationTransition from "@/components/navigation/transicion-navegacion";
import InitialPageLoader from "@/components/navigation/cargador-inicial";
import CursorFollower from "@/components/layout/seguidor-cursor";

const figtree = Figtree({ variable: "--font-loaded-body", subsets: ["latin"], display: "swap" });
const dmMono = DM_Mono({ variable: "--font-loaded-mono", weight: ["400", "500"], subsets: ["latin"], display: "swap" });
const gabarito = localFont({
  src: "./fonts/Gabarito-Variable.ttf",
  variable: "--font-loaded-display",
  display: "swap",
  weight: "400 900",
});

export const metadata = {
  title: "Quokka Studio · Código con instinto",
  description: "Portfolio del equipo de Lenguajes IV: desarrollo fullstack, diseño e interacción.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      data-pal="sonrisa"
      data-cursor-follower="true"
      className={`${figtree.variable} ${dmMono.variable} ${gabarito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppearanceProvider>
        {children}
        <InitialPageLoader />
        <NavigationTransition />
        <QuokkaEffects />
        <CursorFollower />
        </AppearanceProvider>
      </body>
    </html>
  );
}
