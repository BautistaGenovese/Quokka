import type { Metadata } from "next";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "Nuestros Servicios",
  description:
    "Conocé los servicios de diseño y desarrollo web de Quokka Studio.",
};

export default function ServicesPage() {
  return (
    <div className="wrap">
      <PageHeader label="Servicios" title="Nuestros Servicios" />
    </div>
  );
}
