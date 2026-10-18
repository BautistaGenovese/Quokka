"use client";

import { createContext, useContext } from "react";
import usePanelResource from "@/hooks/use-panel-resource";

const CatalogContext = createContext(null);

export function usePanelCatalog() { return useContext(CatalogContext); }

export default function CatalogProvider({ children }) {
  const servicios = usePanelResource("/api/servicios");
  const tecnologias = usePanelResource("/api/tecnologias");
  return <CatalogContext.Provider value={{ servicios, tecnologias }}>{children}</CatalogContext.Provider>;
}
