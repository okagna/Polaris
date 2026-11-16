"use client";
// ============================================================
// COMPOSANT : "Où regarder"
// ------------------------------------------------------------
// Affiche les plateformes (abonnement / location / achat) pour un
// film ou une série. Utilisation :
//   <Plateformes tmdbId={603} type="film" />
// ============================================================

import { useEffect, useState } from "react";
import { useLangue } from "../lib/langue";

// Un bloc = un titre + une rangée de plateformes (logo + nom)
function Groupe({ titre, plateformes }) {
  if (plateformes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-xs font-bold tracking-widest uppercase text-texte-2">{titre}</h3>
      <div className="flex flex-wrap gap-3">
        {plateformes.map((p) => (
          <div key={p.nom} className="flex items-center gap-2.5 pl-2 pr-3.5 py-2 rounded-xl bg-carte-2">
            {p.logo && <img src={p.logo} alt="" className="w-9 h-9 rounded-lg" />}
            <span className="text-sm">{p.nom}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Plateformes({ tmdbId, type }) {
  const { t } = useLangue();
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);

  // Interroge notre route /api/plateformes quand on a un identifiant
  useEffect(() => {
    if (!tmdbId) {
      setChargement(false);
      return;
    }

    async function charger() {
      try {
        const reponse = await fetch(
          `/api/plateformes?id=${tmdbId}&type=${encodeURIComponent(type)}`
        );
        setDonnees(await reponse.json());
      } catch (e) {
        console.error(e);
      }
      setChargement(false);
    }
    charger();
  }, [tmdbId, type]);

  // Jeux vidéo / livres : pas d'identifiant TMDB, on n'affiche rien
  if (!tmdbId) return null;
  if (chargement) return <p className="text-texte-2 mt-4">{t.recherchePlateformes}</p>;

  const aucune =
    !donnees ||
    (donnees.abonnement.length === 0 &&
      donnees.location.length === 0 &&
      donnees.achat.length === 0);

  return (
    <section className="mt-3 bg-carte border border-bordure rounded-2xl p-6 flex flex-col gap-5">
      <h2 className="font-titre text-xl font-semibold">
        {t.ouRegarder} <span className="font-medium text-texte-2">· {t.pays}</span>
      </h2>

      {aucune ? (
        <p className="text-texte-2">{t.aucunePlateforme}</p>
      ) : (
        <>
          <Groupe titre={t.abonnement} plateformes={donnees.abonnement} />
          <Groupe titre={t.location} plateformes={donnees.location} />
          <Groupe titre={t.achat} plateformes={donnees.achat} />
          {donnees.lien && (
            <a href={donnees.lien} target="_blank" rel="noreferrer" className="text-sm font-semibold text-accent hover:text-accent-hover">
              {t.voirDetails}
            </a>
          )}
        </>
      )}
      <p className="text-xs text-texte-3">{t.sourcePlateformes}</p>
    </section>
  );
}
