// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { CarritoProvider } from '@/context/CarritoContext';
import Navbar from "../app/components/Navbar"; // Importación ajustada a tu carpeta root
import WhatsAppBubble from "./components/WhatsAppBubble";
import FacebookPixel  from "./components/FacebookPixel";

export const metadata: Metadata = {
  title: "Moriancumer - Impresiones 3D",
  description: "Detalles únicos que fortalecen la fe",

  icons: {
    icon: "/logo.svg", // Aquí usas la ruta a tu logo en la carpeta public
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  // CÓDIGO DE VERIFICACIÓN DE META
  verification: {
    other: {
      "facebook-domain-verification": ["dqgzoxxli0zosdsqi6bhwla0mb61pd"],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">
        <FacebookPixel />
        <CarritoProvider>
          <Navbar />
          <div className="pt-20">
            {children}
          </div>
          <WhatsAppBubble />
        </CarritoProvider>
      </body>
    </html>
  );
}