import type { Metadata } from "next";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Inicio de Quokka Studio: diseño y desarrollo de experiencias web.",
};

export default function HomePage() {
  return (
    <div className="wrap">
      <PageHeader label="Inicio" title="Inicio" />
    </div>
  );
}
