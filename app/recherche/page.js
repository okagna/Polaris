"use client";
// ============================================================
// PAGE DES RÉSULTATS  (adresse : /recherche?q=ta description)
// ------------------------------------------------------------
// Lit la description dans l'adresse, interroge l'IA (via /api/recherche)
// et affiche les films / séries / jeux / livres trouvés.
// ============================================================

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFavoris } from "../lib/favoris";
import { useLangue } from "../lib/langue";
import CartePoster from "../composants/CartePoster";

function Resultats() {
  const { langue, t } = useLangue();

  // "q" = la description tapée sur l'accueil, lue dans l'adresse
  const params = useSearchParams();
  const q = params.get("q") || "";
  const router = useRouter();

  // Le texte du champ de recherche en haut de la page.
  // Il commence avec la description actuelle, et on peut le modifier.
  const [texte, setTexte] = useState(q);

  // Si l'adresse change (nouvelle recherche), on remet le champ à jour
  useEffect(() => {
    setTexte(q);
  }, [q]);

  // Relance une recherche avec le nouveau texte : on change juste l'adresse,
  // et le useEffect plus bas (qui surveille "q") refait la recherche
  function relancerRecherche(e) {
    e.preventDefault(); // empêche le formulaire de recharger toute la page
    const nouveau = texte.trim();
    if (!nouveau || nouveau === q) return; // vide ou identique : rien à faire
    router.push(`/recherche?q=${encodeURIComponent(nouveau)}`);
  }

  const [resultats, setResultats] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  // Gestion des cœurs (voir app/lib/favoris.js)
  const { titresAimes, basculerFavori } = useFavoris();

  // Référence vers la rangée défilante (même principe que les tendances)
  const refRangee = useRef(null);

  // Fait défiler la rangée vers la gauche ou la droite
  function defiler(direction) {
    refRangee.current?.scrollBy({
      left: direction === "gauche" ? -600 : 600,
      behavior: "smooth",
    });
  }

  // Style commun des flèches gauche / droite
  const styleFleche =
    "w-11 h-11 rounded-full border border-bordure bg-carte hover:bg-carte-2 flex items-center justify-center transition";

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

        // La route a renvoyé une erreur (IA en panne, réponse illisible...) :
        // on passe dans le "catch" plus bas, qui affiche le message d'erreur
        if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`);

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
          {t.retourAccueil}
        </Link>

        {/* Champ de recherche : on peut modifier la description et relancer.
            Un <form> permet de lancer avec la touche Entrée automatiquement. */}
        <form
          onSubmit={relancerRecherche}
          className="bg-carte border border-bordure rounded-2xl pl-6 pr-2 py-2 flex flex-wrap items-center gap-4 focus-within:border-accent/60 transition"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-texte-2 shrink-0" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20 L16 16" />
          </svg>
          <label htmlFor="nouvelle-description" className="sr-only">
            {t.labelDescription}
          </label>
          <input
            id="nouvelle-description"
            type="text"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder={t.exemple}
            className="flex-1 min-w-60 bg-transparent text-lg py-3 focus:outline-none"
          />
          <button
            type="submit"
            className="h-12 px-6 rounded-xl bg-accent hover:bg-accent-hover text-fond font-bold transition"
          >
            {t.boutonRechercher}
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-titre text-3xl font-bold">{t.resultats}</h1>
        {!chargement && !erreur && resultats.length > 0 && (
          <span className="text-texte-2">{t.titresTrouves(resultats.length)}</span>
        )}

        {/* Flèches pour faire défiler (seulement s'il y a des résultats) */}
        {resultats.length > 0 && (
          <div className="ml-auto flex gap-2 self-center">
            <button onClick={() => defiler("gauche")} className={styleFleche} aria-label={t.precedent}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 6 L9 12 L15 18" />
              </svg>
            </button>
            <button onClick={() => defiler("droite")} className={styleFleche} aria-label={t.suivant}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6 L15 12 L9 18" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Messages d'état */}
      {chargement && <p className="text-texte-2">{t.rechercheEnCours}</p>}
      {erreur && <p className="text-coeur">{t.erreur}</p>}
      {!chargement && !erreur && resultats.length === 0 && (
        <p className="text-texte-2">{t.aucunResultat}</p>
      )}

      {/* Rangée défilante des résultats (comme les tendances), du plus
          probable au moins probable. Le badge montre le type (film, jeu...). */}
      <div ref={refRangee} className="flex gap-5 overflow-x-auto pb-4 scroll-smooth">
        {resultats.map((element, i) => (
          <div key={i} className="w-44 shrink-0">
            <CartePoster
              element={element}
              aime={titresAimes.includes(element.titre)}
              onBasculer={basculerFavori}
            />
          </div>
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
