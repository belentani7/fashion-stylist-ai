import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NATALIA — Personal Style Studio",
  description: "Armario privado, conjuntos propios, coste por uso y decisiones de estilo conscientes. Un espacio local-first para expresar tu identidad sin escanear cuerpos.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "NATALIA — Personal Style Studio",
    description: "Style is yours. A private personal wardrobe and look planner.",
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
