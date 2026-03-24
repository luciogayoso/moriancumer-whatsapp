"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FacebookPixel() {
  const pathname = usePathname();

  useEffect(() => {
    // Importación dinámica para que solo cargue en el cliente
    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init("26228274990132761"); // REEMPLAZÁ CON TU ID
        ReactPixel.pageView();
      });
  }, [pathname]); // Se dispara cada vez que cambia la ruta (URL)

  return null;
}