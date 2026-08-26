"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Refresca la página del lado del servidor cada `seconds` segundos, para
// pantallas de "esperando resultado" (pago / generación de imagen en curso).
export default function AutoRefresh({ seconds = 4 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.refresh();
    }, seconds * 1000);
    return () => clearTimeout(timer);
  }, [seconds, router]);

  return null;
}
