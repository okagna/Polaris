"use client";
// ============================================================
// PAGE DÉTAIL D'UN FAVORI  (adresse : /favoris/12, /favoris/13...)
// ------------------------------------------------------------
// Le nombre dans l'adresse ([id]) est l'identifiant du favori dans la
// table "likes". On le lit avec useParams() pour récupérer la bonne ligne.
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useLangue, nomType } from "../../lib/langue";
import Plateformes from "../../composants/Plateformes";
import Casting from "../../composants/Casting";

export default function DetailFavori() {
  const params = useParams(); // contient { id: "12" } par exemple
  const router = useRouter(); // sert au bouton "Retour"
  const { langue, t } = useLangue();

  const [favori, setFavori] = useState(null);
  const [chargement, setChargement] = useState(true);

  // Lit dans la base le favori dont l'identifiant est dans l'adresse
  useEffect(() => {
    async function chargerFavori() {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("id", params.id)
        .single(); // on attend UNE seule ligne

      if (!error && data) {
        setFavori(data);
      }
      setChargement(false);
    }
    chargerFavori();
  }, [params.id]);

  // La table "likes" garde le titre et le résumé dans la langue du moment
  // où le favori a été ajouté, et pas le casting. Pour les films / séries,
  // on redemande donc la fiche à /api/detail, dans la langue actuelle.
  const [fiche, setFiche] = useState(null);

  useEffect(() => {
    if (!favori?.tmdb_id) return; // jeu, livre... : pas de fiche TMDB

    async function chargerFiche() {
      try {
        const reponse = await fetch(
          `/api/detail?id=${favori.tmdb_id}&type=${encodeURIComponent(favori.type)}&langue=${langue}`
        );
        if (reponse.ok) setFiche(await reponse.json());
      } catch (e) {
        console.error(e);
      }
    }
    chargerFiche();
  }, [favori, langue]);

  if (chargement) return <p className="text-texte-2">{t.chargement}</p>;
  if (!favori) return <p className="text-texte-2">{t.favoriIntrouvable}</p>;

  // On préfère les infos de la fiche (dans la bonne langue) si on les a,
  // sinon on garde celles enregistrées dans la base
  const titre = fiche?.titre || favori.titre;
  const resume = fiche?.resume || favori.resume;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-7">
      {/* Retour à la page précédente */}
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
        {/* Grande affiche */}
        {favori.poster && (
          <img src={favori.poster} alt={titre} className="w-56 shrink-0 rounded-2xl shadow-2xl shadow-black/50" />
        )}

        {/* Type, titre et résumé complet */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <span className="self-start px-2.5 py-1 rounded-md bg-carte-2 text-accent text-xs font-bold tracking-widest uppercase">
            {nomType(t, favori.type)}
          </span>
          <h1 className="font-titre font-bold text-4xl leading-tight">
            {titre}{" "}
            {favori.annee && <span className="font-medium text-texte-2">({favori.annee})</span>}
          </h1>
          <p className="text-base leading-relaxed text-clair">{resume || t.resumeIndispo}</p>

          {/* Où regarder : seulement pour les films / séries (ils ont un tmdb_id) */}
          <Plateformes tmdbId={favori.tmdb_id} type={favori.type} />
        </div>
      </div>

      {/* Casting sur toute la largeur, sous la fiche */}
      <Casting acteurs={fiche?.casting} />
    </div>
  );
}
