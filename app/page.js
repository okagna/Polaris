"use client";
// ============================================================
// PAGE D'ACCUEIL  (adresse : /)
// ------------------------------------------------------------
// - En haut : la grande zone pour décrire le film oublié
// - En dessous : la rangée "Tendances" (films et séries du moment, via TMDB)
// Quand on lance une recherche, on est envoyé vers /recherche?q=...
// Tous les textes viennent de app/lib/langue.js (t.xxx).
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFavoris } from "./lib/favoris";
import { useLangue } from "./lib/langue";
import CartePoster from "./composants/CartePoster";

export default function Accueil() {
  const router = useRouter();
  const { langue, t } = useLangue();

  // Le texte que l'utilisateur est en train d'écrire
  const [description, setDescription] = useState("");
  // La liste des films en tendance + la période choisie ("jour" ou "semaine")
  const [tendances, setTendances] = useState([]);
  const [periode, setPeriode] = useState("jour");
  // Référence vers la rangée défilante (pour la faire bouger avec les flèches)
  const refTendances = useRef(null);

  // Gestion des cœurs (voir app/lib/favoris.js)
  const { titresAimes, basculerFavori } = useFavoris();

  // Fait défiler la rangée de tendances vers la gauche ou la droite
  function defilerTendances(direction) {
    refTendances.current?.scrollBy({
      left: direction === "gauche" ? -600 : 600,
      behavior: "smooth",
    });
  }

  // Recharge les tendances quand la période OU la langue change
  useEffect(() => {
    async function chargerTendances() {
      try {
        const reponse = await fetch(`/api/tendances?periode=${periode}&langue=${langue}`);
        const donnees = await reponse.json();
        setTendances(donnees.resultats || []);
      } catch (erreur) {
        console.error("Impossible de charger les tendances :", erreur);
      }
    }
    chargerTendances();
  }, [periode, langue]);

  // Lance la recherche : on change de page avec la description dans l'adresse
  function lancerRecherche() {
    if (!description.trim()) return; // rien d'écrit -> on ne fait rien
    router.push(`/recherche?q=${encodeURIComponent(description.trim())}`);
  }

  // Style d'un bouton "Aujourd'hui" / "Cette semaine" (actif = clair)
  function stylePeriode(actif) {
    return `min-h-9 px-4 rounded-full text-sm font-semibold transition ${
      actif ? "bg-texte text-fond" : "text-texte-2 hover:text-texte"
    }`;
  }

  // Style commun des flèches gauche / droite
  const styleFleche =
    "w-11 h-11 rounded-full border border-bordure bg-carte hover:bg-carte-2 flex items-center justify-center transition";

  return (
    <div>
      {/* ---------- Zone de recherche ---------- */}
      <section className="flex flex-col items-center text-center gap-5 pt-14 pb-16">
        <span className="text-[13px] font-semibold tracking-[0.15em] uppercase text-accent">
          {t.accroche}
        </span>
        <h1 className="font-titre font-bold text-4xl md:text-6xl leading-[1.05] max-w-3xl">
          {t.titreAccueil}
        </h1>
        <p className="text-lg text-texte-2 max-w-xl">{t.sousTitre}</p>

        {/* La carte de recherche */}
        <div className="w-full max-w-3xl mt-4 bg-carte border border-bordure rounded-2xl p-2 text-left shadow-2xl shadow-black/40 focus-within:border-accent/60 transition">
          <label htmlFor="description" className="sr-only">
            {t.labelDescription}
          </label>
          {/* Zone de texte : Entrée lance la recherche, Maj+Entrée = retour à la ligne */}
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                lancerRecherche();
              }
            }}
            placeholder={t.exemple}
            rows={3}
            className="w-full resize-none bg-transparent text-texte text-[17px] leading-relaxed px-4 py-4 focus:outline-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 pl-4 pr-2 pb-1">
            <span className="text-[13px] text-texte-3">{t.aideClavier}</span>
            <button
              onClick={lancerRecherche}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-accent hover:bg-accent-hover text-fond font-bold transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20 L16 16" />
              </svg>
              {t.boutonRechercher}
            </button>
          </div>
        </div>

        {/* Exemples : un clic remplit la zone de texte */}
        <div className="flex flex-wrap justify-center items-center gap-2.5">
          <span className="text-[13px] text-texte-3">{t.essaie}</span>
          {t.exemples.map((exemple) => (
            <button
              key={exemple}
              onClick={() => setDescription(exemple)}
              className="min-h-10 px-3.5 rounded-full border border-bordure text-clair text-[13px] hover:border-accent/60 hover:text-texte transition"
            >
              {exemple}
            </button>
          ))}
        </div>
      </section>

      {/* ---------- Rangée des tendances ---------- */}
      <section>
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <h2 className="font-titre text-[26px] font-semibold">{t.tendances}</h2>

          {/* Choix de la période */}
          <div className="flex p-1 rounded-full bg-carte border border-bordure">
            <button onClick={() => setPeriode("jour")} className={stylePeriode(periode === "jour")}>
              {t.aujourdhui}
            </button>
            <button onClick={() => setPeriode("semaine")} className={stylePeriode(periode === "semaine")}>
              {t.cetteSemaine}
            </button>
          </div>

          {/* Flèches pour faire défiler */}
          <div className="ml-auto flex gap-2">
            <button onClick={() => defilerTendances("gauche")} className={styleFleche} aria-label={t.precedent}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 6 L9 12 L15 18" />
              </svg>
            </button>
            <button onClick={() => defilerTendances("droite")} className={styleFleche} aria-label={t.suivant}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6 L15 12 L9 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Rangée défilante des affiches */}
        <div ref={refTendances} className="flex gap-5 overflow-x-auto pb-4 scroll-smooth">
          {tendances.map((element, index) => (
            <div key={`${element.type}-${element.tmdb_id}`} className="w-44 shrink-0">
              <CartePoster
                element={element}
                badge={`#${index + 1}`}
                aime={titresAimes.includes(element.titre)}
                onBasculer={basculerFavori}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
