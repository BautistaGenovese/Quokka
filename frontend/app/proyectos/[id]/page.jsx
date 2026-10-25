import { notFound } from "next/navigation";
import ProjectDetail from "@/components/portfolio/detalle-proyecto";

export const metadata = { title: "Proyecto · Quokka Studio", robots: { index: false, follow: false } };

/** Cascarón de servidor: valida el id; la sesión y los datos se resuelven en el cliente. */
export default async function ProjectPage({ params }) {
  const { id } = await params;
  // Mismo rango que proyectos.id (INTEGER de 32 bits) en el backend.
  if (!/^[1-9]\d{0,9}$/.test(id) || Number(id) > 2147483647) notFound();
  return <ProjectDetail id={id} />;
}
