"use client";
// ============================================================
// PAGE DES FAVORIS  (adresse : /favoris)
// ------------------------------------------------------------
// Affiche tout ce qui a été ajouté avec le cœur (table "likes" de
// Supabase). Cliquer sur une carte ouvre le détail, ✕ retire le favori.
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useLangue, nomType } from "../lib/langue";

export default function PageFavoris() {
  const { t } = useLangue();
  const [favoris, setFavoris] = useState([]);
  const [chargement, setChargement] = useState(true);

  // Lit les favoris dans la base, du plus récent au plus ancien
  async function chargerFavoris() {
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFavoris(data);
    }
    setChargement(false);
  }

  // Au chargement de la page : on lit les favoris une fois
  useEffect(() => {
    chargerFavoris();
  }, []);

  // Supprime un favori de la base, puis de la liste affichée
  async function supprimerFavori(id) {
    const { error } = await supabase.from("likes").delete().eq("id", id);

    if (error) {
      alert(t.erreurSuppression);
      console.error(error);
    } else {
      setFavoris(favoris.filter((favori) => favori.id !== id));
    }
  }

  if (chargement) return <p className="text-texte-2">{t.chargement}</p>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-7">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-titre text-4xl font-bold">{t.mesFavoris}</h1>
        {favoris.length > 0 && <span className="text-texte-2">{t.nbTitres(favoris.length)}</span>}
      </div>

      {/* Écran vide si aucun favori */}
      {favoris.length === 0 && (
        <div className="bg-carte border border-dashed border-bordure rounded-2xl py-14 px-6 flex flex-col items-center gap-3.5 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="text-texte-2" aria-hidden="true">
            <path d="M12 20 C5 15 3 12 3 8.5 C3 6 5 4 7.5 4 C9.3 4 11 5 12 6.6 C13 5 14.7 4 16.5 4 C19 4 21 6 21 8.5 C21 12 19 15 12 20 Z" />
          </svg>
          <p className="text-lg font-semibold">{t.aucunFavori}</p>
          <p className="text-texte-2">{t.aucunFavoriAide}</p>
          <Link
            href="/"
            className="mt-1.5 inline-flex items-center h-12 px-5 rounded-xl bg-accent hover:bg-accent-hover text-fond font-bold transition"
          >
            {t.lancerRecherche}
          </Link>
        </div>
      )}

      {/* Une carte par favori */}
      <div className="flex flex-col gap-3.5">
        {favoris.map((favori) => (
          <div
            key={favori.id}
            className="flex gap-3 items-start bg-carte border border-bordure rounded-2xl p-3.5 hover:border-texte-3 transition"
          >
            {/* Partie cliquable : ouvre la page de détail */}
            <Link href={`/favoris/${favori.id}`} className="flex gap-5 flex-1 min-w-0">
              {favori.poster ? (
                <img src={favori.poster} alt={favori.titre} className="w-22 aspect-[2/3] object-cover rounded-lg shrink-0" />
              ) : (
                <div className="w-22 aspect-[2/3] rounded-lg bg-carte-2 shrink-0" />
              )}
              <div className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg font-semibold">{favori.titre}</h3>
                  {favori.annee && <span className="text-sm text-texte-2">{favori.annee}</span>}
                  <span className="px-2 py-0.5 rounded-md bg-carte-2 text-accent text-[11px] font-bold tracking-wide uppercase">
                    {nomType(t, favori.type)}
                  </span>
                </div>
                {/* Résumé coupé à 2 lignes */}
                {favori.resume && (
                  <p className="text-sm leading-relaxed text-clair line-clamp-2">{favori.resume}</p>
                )}
              </div>
            </Link>

            {/* Bouton pour retirer le favori */}
            <button
              onClick={() => supprimerFavori(favori.id)}
              className="w-11 h-11 shrink-0 rounded-lg flex items-center justify-center text-texte-2 hover:text-coeur hover:bg-carte-2 transition"
              aria-label={t.retirerFavori}
              title={t.retirerFavori}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6 L18 18 M18 6 L6 18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
