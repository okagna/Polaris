// ============================================================
// Structure commune à TOUTES les pages du site
// ------------------------------------------------------------
// Tout ce qui est ici (en-tête, fond, largeur) s'affiche sur chaque page.
// Le contenu propre à chaque page arrive dans "children".
// ============================================================

import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { FournisseurLangue } from "./lib/langue";
import EnTete from "./composants/EnTete";

// Polices Google chargées par Next.js.
// "variable" crée une variable CSS qu'on réutilise dans globals.css
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

// Titre de l'onglet du navigateur et description du site
export const metadata = {
  title: "Polaris",
  description: "Retrouve un film, une série, un jeu ou un livre à partir d'une description",
};

export default function LayoutPrincipal({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-fond text-texte font-sans antialiased">
        {/* La langue est disponible partout à l'intérieur de ce bloc */}
        <FournisseurLangue>
          <EnTete />
          {/* Zone centrale : le contenu de la page affichée */}
          <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        </FournisseurLangue>
      </body>
    </html>
  );
}
