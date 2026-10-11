import type { Metadata } from "next";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "Panel de Control",
  description: "Panel de control de Quokka Studio.",
};

export default function DashboardPage() {
  return (
    <div className="wrap">
      <PageHeader label="Panel de Control" title="Panel de Control">
        <p>Esta área está reservada para usuarios autorizados.</p>
      </PageHeader>
    </div>
  );
}
