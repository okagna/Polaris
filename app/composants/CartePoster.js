"use client";
// ============================================================
// Carte d'un film / d'une série : affiche + titre + année + cœur
// ------------------------------------------------------------
// Utilisée sur l'accueil (tendances) et sur la page des résultats.
//
// Les "props" (ce qu'on lui donne) :
//   - element    : l'objet du film (titre, annee, type, poster...)
//   - aime       : true si le film est déjà en favoris (cœur plein)
//   - onBasculer : fonction appelée quand on clique sur le cœur
//   - badge      : (optionnel) petit texte en haut à gauche de l'affiche,
//                  ex : "#1" pour les tendances. Par défaut : le type.
// ============================================================

import Link from "next/link";
import { useLangue, nomType } from "../lib/langue";

export default function CartePoster({ element, aime, onBasculer, badge }) {
  const { t } = useLangue();

  // Adresse de la page de détail. Seuls les films et séries trouvés sur
  // TMDB (donc avec un tmdb_id) en ont une. Dans l'adresse, "série" s'écrit
  // "serie" sans accent (voir app/detail/[type]/[id]/page.js).
  const aUneFiche =
    element.tmdb_id && (element.type === "film" || element.type === "série");
  const lienDetail = aUneFiche
    ? `/detail/${element.type === "série" ? "serie" : "film"}/${element.tmdb_id}`
    : null;

  // Si on a une fiche, l'affiche et le titre deviennent des liens.
  // Sinon (jeu, livre...), ce sont de simples blocs.
  const Conteneur = lienDetail ? Link : "div";

  return (
    <div className="flex flex-col gap-2.5">
      {/* Zone de l'affiche, format 2/3 comme une vraie affiche */}
      <Conteneur
        {...(lienDetail ? { href: lienDetail } : {})}
        className="relative block rounded-xl overflow-hidden bg-carte-2 aspect-[2/3] shadow-lg shadow-black/30"
      >
        {element.poster ? (
          <img
            src={element.poster}
            alt={element.titre}
            className="w-full h-full object-cover transition duration-300 hover:scale-105"
          />
        ) : (
          // Pas d'affiche disponible : on affiche un texte à la place
          <div className="w-full h-full flex items-center justify-center text-texte-3 text-sm p-2 text-center">
            {t.pasAffiche}
          </div>
        )}

        {/* Badge en haut à gauche (rang ou type) */}
        <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded-md bg-fond/80 text-texte text-[11px] font-bold uppercase tracking-wide">
          {badge ?? nomType(t, element.type)}
        </span>
      </Conteneur>

      {/* Titre + année à gauche, cœur à droite */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2">
            {lienDetail ? (
              <Link href={lienDetail} className="hover:text-accent transition">
                {element.titre}
              </Link>
            ) : (
              element.titre
            )}
          </h3>
          <p className="text-xs text-texte-2 mt-1">{element.annee}</p>
        </div>

        {/* Bouton cœur : plein et rose si déjà en favoris */}
        <button
          onClick={() => onBasculer(element)}
          className={`w-11 h-11 -mt-2 -mr-2.5 shrink-0 flex items-center justify-center transition ${
            aime ? "text-coeur" : "text-texte-2 hover:text-texte"
          }`}
          aria-label={aime ? t.retirerFavori : t.ajouterFavori}
          title={aime ? t.retirerFavori : t.ajouterFavori}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={aime ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20 C5 15 3 12 3 8.5 C3 6 5 4 7.5 4 C9.3 4 11 5 12 6.6 C13 5 14.7 4 16.5 4 C19 4 21 6 21 8.5 C21 12 19 15 12 20 Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
