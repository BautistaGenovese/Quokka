import type { Metadata } from "next";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "Panel de Servicios",
  description: "Gestión de servicios del panel de control de Quokka Studio.",
};

export default function DashboardServicesPage() {
  return (
    <div className="wrap">
      <PageHeader
        label="Servicios"
        title="Panel de Servicios - Usuarios Autorizados"
      >
        <p>Esta área está reservada para usuarios autorizados.</p>
      </PageHeader>
    </div>
  );
}
