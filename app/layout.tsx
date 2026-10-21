import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NATALIA STUDIO — Tu estilo, tu armario",
  description: "Un estudio privado de estilo personal. Organiza tus prendas, descubre combinaciones sin compras obligatorias y controla tu información desde el navegador.",
  applicationName: "NATALIA STUDIO",
  keywords: ["estilismo personal", "armario digital", "moda inclusiva", "outfits", "consumo responsable"],
  robots: { index: true, follow: true },
  openGraph: {
    title: "NATALIA STUDIO — Tu estilo, tu armario",
    description: "Style is personal. La libertad de elegir lo que ya tienes.",
    type: "website",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#110e14",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
