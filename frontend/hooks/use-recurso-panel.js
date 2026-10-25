"use client";

import { useCallback, useEffect, useState } from "react";
import { panelList } from "@/lib/panel-api";

/** Cada recarga cancela la anterior; nunca reemplaza datos de otra navegación. */
export default function usePanelResource(path) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ data: [], loading: true, error: null });
  useEffect(() => {
    const controller = new AbortController();
    panelList(path, { signal: controller.signal }).then(
      data => { if (!controller.signal.aborted) setState({ data, loading: false, error: null }); },
      error => { if (!controller.signal.aborted) setState(previous => ({ ...previous, loading: false, error })); },
    );
    return () => controller.abort();
  }, [path, version]);
  const reload = useCallback(() => {
    setState(previous => ({ ...previous, loading: true, error: null }));
    setVersion(previous => previous + 1);
  }, []);
  return { ...state, reload };
}
