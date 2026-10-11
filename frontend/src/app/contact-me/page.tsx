import type { Metadata } from "next";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "Contáctame",
  description: "Ponte en contacto con Quokka Studio.",
};

export default function ContactPage() {
  return (
    <div className="wrap">
      <PageHeader label="Contacto" title="Contáctame" />
    </div>
  );
}
