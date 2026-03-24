"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppBubble() {
  const [mounted, setMounted] = useState(false);

  // Evita errores de hidratación en Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const TELEFONO = "5491141652850"; //
  const MENSAJE_INICIAL = encodeURIComponent("¡Hola Moriancumer! Estoy navegando por la web y tengo una consulta.");

  return (
    <a
      href={`https://wa.me/${TELEFONO}?text=${MENSAJE_INICIAL}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-[#128C7E] transition-all duration-300 flex items-center justify-center group"
    >
      <span className="absolute right-16 bg-white text-slate-800 text-xs font-bold px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100 pointer-events-none">
        ¿Necesitás ayuda?
      </span>
      
      <MessageCircle size={28} fill="currentColor" />
      
      {/* Efecto visual de pulso */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
    </a>
  );
}