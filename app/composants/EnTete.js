"use client";
// ============================================================
// En-tête du site (bandeau en haut de toutes les pages)
// Contient : le logo, le menu (Recherche / Explorer / Favoris) et le choix FR / EN
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLangue } from "../lib/langue";

// Les liens du menu. "chemin" = l'adresse actuelle, pour mettre en
// évidence le lien de la page où on est (null = aucun lien en évidence)
function LiensMenu({ chemin }) {
  const { t } = useLangue();

  // Style d'un lien du menu : fond plus clair si c'est la page actuelle
  function styleLien(actif) {
    return `px-4 py-3 rounded-lg text-sm transition ${
      actif ? "bg-carte-2 text-texte font-semibold" : "text-texte-2 font-medium hover:text-texte"
    }`;
  }

  return (
    <nav className="flex gap-1">
      <Link href="/" className={styleLien(chemin === "/" || chemin?.startsWith("/recherche"))}>
        {t.recherche}
      </Link>
      <Link href="/explorer" className={styleLien(chemin?.startsWith("/explorer"))}>
        {t.explorer}
      </Link>
      <Link href="/favoris" className={styleLien(chemin?.startsWith("/favoris"))}>
        {t.favoris}
      </Link>
    </nav>
  );
}

// Le menu qui lit l'adresse actuelle avec usePathname().
// Avec "cacheComponents" (next.config.ts), sur une page comme /favoris/12,
// l'adresse n'est pas connue au moment du build : usePathname() "attend".
// C'est pour ça qu'on l'entoure d'un <Suspense> plus bas.
function MenuActif() {
  const chemin = usePathname();
  return <LiensMenu chemin={chemin} />;
}

export default function EnTete() {
  const { langue, changerLangue } = useLangue();

  // Style d'un bouton de langue : le bouton actif est plus clair
  function styleLangue(actif) {
    return `min-w-11 h-9 rounded-md text-xs font-bold transition ${
      actif ? "bg-bordure text-texte" : "text-texte-2 hover:text-texte"
    }`;
  }

  return (
    <header className="border-b border-bordure/70">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center gap-8">
        {/* Logo : une étoile dorée + le nom */}
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" className="fill-accent" />
          </svg>
          <span className="font-titre font-bold text-[22px] tracking-wide">Polaris</span>
        </Link>

        {/* Menu : en attendant de connaître l'adresse, on affiche les mêmes
            liens sans en mettre un en évidence (le "fallback") */}
        <Suspense fallback={<LiensMenu chemin={null} />}>
          <MenuActif />
        </Suspense>

        {/* Boutons de choix de la langue */}
        <div className="ml-auto flex p-1 rounded-lg bg-carte border border-bordure">
          <button onClick={() => changerLangue("fr")} className={styleLangue(langue === "fr")}>
            FR
          </button>
          <button onClick={() => changerLangue("en")} className={styleLangue(langue === "en")}>
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
