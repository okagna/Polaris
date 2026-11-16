"use client";
// ============================================================
// PAGE DE DÉTAIL  (adresse : /detail/film/603  ou  /detail/serie/1399)
// ------------------------------------------------------------
// Les deux morceaux de l'adresse ([type] et [id]) se lisent avec
// useParams(). On demande la fiche à /api/detail puis on affiche
// aussi "Où regarder".
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Plateformes from "../../../composants/Plateformes";
import Casting from "../../../composants/Casting";
import { useLangue, nomType } from "../../../lib/langue";

export default function PageDetail() {
  const params = useParams(); // { type: "film", id: "603" }
  const router = useRouter();
  const { langue, t } = useLangue();

  // Dans l'adresse on écrit "serie" sans accent, on remet l'accent ici
  const type = params.type === "serie" ? "série" : "film";

  const [fiche, setFiche] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      try {
        const reponse = await fetch(
          `/api/detail?id=${params.id}&type=${encodeURIComponent(type)}&langue=${langue}`
        );
        if (reponse.ok) setFiche(await reponse.json());
      } catch (e) {
        console.error(e);
      }
      setChargement(false);
    }
    charger();
    // On recharge aussi quand la langue change (titre, résumé, genres traduits)
  }, [params.id, type, langue]);

  if (chargement) return <p className="text-texte-2">{t.chargement}</p>;
  if (!fiche) return <p className="text-texte-2">{t.ficheIntrouvable}</p>;

  // Petit style réutilisé pour les pastilles (genres, durée, note)
  const pastille = "px-3 py-1.5 rounded-full text-[13px]";

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-7">
      <button
        onClick={() => router.back()}
        className="self-start inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-accent hover:text-accent-hover"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 6 L9 12 L15 18" />
        </svg>
        {t.retour}
      </button>

      <div className="flex flex-col sm:flex-row gap-10 items-start">
        {fiche.poster && (
          <img
            src={fiche.poster}
            alt={fiche.titre}
            className="w-64 shrink-0 rounded-2xl shadow-2xl shadow-black/50"
          />
        )}

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Type */}
          <span className="self-start px-2.5 py-1 rounded-md bg-carte-2 text-accent text-xs font-bold tracking-widest uppercase">
            {nomType(t, fiche.type)}
          </span>

          {/* Titre + année */}
          <h1 className="font-titre font-bold text-4xl md:text-5xl leading-[1.05]">
            {fiche.titre}{" "}
            {fiche.annee && <span className="font-medium text-texte-2">({fiche.annee})</span>}
          </h1>

          {/* Genres, durée, note en pastilles */}
          <div className="flex flex-wrap gap-2">
            {fiche.genres.map((genre) => (
              <span key={genre} className={`${pastille} border border-bordure text-clair`}>
                {genre}
              </span>
            ))}
            {fiche.duree && <span className={`${pastille} bg-carte-2 text-clair`}>{fiche.duree} min</span>}
            {fiche.note && (
              <span className={`${pastille} bg-carte-2 inline-flex items-center gap-1.5`}>
                <svg width="14" height="14" viewBox="0 0 24 24" className="fill-accent" aria-hidden="true">
                  <path d="M12 3 L14.6 9 L21 9.6 L16.2 13.8 L17.6 20 L12 16.7 L6.4 20 L7.8 13.8 L3 9.6 L9.4 9 Z" />
                </svg>
                {fiche.note}/10
              </span>
            )}
          </div>

          {/* Résumé */}
          <p className="text-base leading-relaxed text-clair max-w-2xl">
            {fiche.resume || t.resumeIndispo}
          </p>

          <Plateformes tmdbId={fiche.tmdb_id} type={fiche.type} />
        </div>
      </div>

      {/* ---------- Casting (sur toute la largeur, sous la fiche) ---------- */}
      <Casting acteurs={fiche.casting} />
    </div>
  );
}
