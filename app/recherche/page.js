"use client";
// ============================================================
// PAGE DES RÉSULTATS  (adresse : /recherche?q=ta description)
// ------------------------------------------------------------
// Lit la description dans l'adresse, interroge l'IA (via /api/recherche)
// et affiche les films / séries / jeux / livres trouvés.
// ============================================================

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFavoris } from "../lib/favoris";
import { useLangue } from "../lib/langue";
import CartePoster from "../composants/CartePoster";

function Resultats() {
  const { langue, t } = useLangue();

  // "q" = la description tapée sur l'accueil, lue dans l'adresse
  const params = useSearchParams();
  const q = params.get("q") || "";

  const [resultats, setResultats] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  // Gestion des cœurs (voir app/lib/favoris.js)
  const { titresAimes, basculerFavori } = useFavoris();

  // Lance la recherche à l'arrivée sur la page, et si la description
  // ou la langue change
  useEffect(() => {
    if (!q) {
      setChargement(false);
      return;
    }

    async function chercher() {
      setChargement(true);
      setErreur(false);
      // La langue fait partie de la clé : une recherche en anglais
      // n'est pas la même qu'une recherche en français
      const cleCache = `polaris_q_${langue}_${q}`;

      // Si la même recherche a déjà été faite, on réutilise le résultat
      // (évite de rappeler l'IA, qui est payante, à chaque F5)
      try {
        const enCache = sessionStorage.getItem(cleCache);
        if (enCache) {
          setResultats(JSON.parse(enCache));
          setChargement(false);
          return;
        }
      } catch {}

      try {
        // Appel à notre route serveur : app/api/recherche/route.js
        const reponse = await fetch("/api/recherche", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: q, langue }),
        });
        const donnees = await reponse.json();

        // On retire les doublons (même titre proposé plusieurs fois)
        const uniques = (donnees.resultats || []).filter(
          (element, index, liste) =>
            index === liste.findIndex((autre) => autre.titre === element.titre)
        );

        setResultats(uniques);

        // On garde le résultat en mémoire pour cette session
        try {
          sessionStorage.setItem(cleCache, JSON.stringify(uniques));
        } catch {}
      } catch (e) {
        console.error(e);
        setErreur(true);
      }
      setChargement(false);
    }

    chercher();
  }, [q, langue]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="self-start inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-accent hover:text-accent-hover"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6 L9 12 L15 18" />
          </svg>
          {t.nouvelleRecherche}
        </Link>

        {/* Rappel de la description recherchée */}
        <div className="bg-carte border border-bordure rounded-2xl px-6 py-5 flex flex-wrap items-center gap-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-texte-2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20 L16 16" />
          </svg>
          <p className="flex-1 min-w-60 text-lg leading-snug">« {q} »</p>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-titre text-3xl font-bold">{t.resultats}</h1>
        {!chargement && !erreur && resultats.length > 0 && (
          <span className="text-texte-2">{t.titresTrouves(resultats.length)}</span>
        )}
      </div>

      {/* Messages d'état */}
      {chargement && <p className="text-texte-2">{t.rechercheEnCours}</p>}
      {erreur && <p className="text-coeur">{t.erreur}</p>}
      {!chargement && !erreur && resultats.length === 0 && (
        <p className="text-texte-2">{t.aucunResultat}</p>
      )}

      {/* Grille des résultats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-5 gap-y-7">
        {resultats.map((element, i) => (
          <CartePoster
            key={i}
            element={element}
            aime={titresAimes.includes(element.titre)}
            onBasculer={basculerFavori}
          />
        ))}
      </div>
    </div>
  );
}

// "Suspense" est obligatoire avec useSearchParams : il affiche un texte
// d'attente le temps que l'adresse soit lue.
export default function PageRecherche() {
  return (
    <Suspense fallback={<p className="text-texte-2">…</p>}>
      <Resultats />
    </Suspense>
  );
}
