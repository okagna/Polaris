"use client";
// ============================================================
// COMPOSANT : "Casting"
// ------------------------------------------------------------
// Affiche une rangée défilante d'acteurs (photo + nom + personnage).
// Utilisé sur la page de détail ET sur la page d'un favori.
//
// Utilisation :
//   <Casting acteurs={fiche.casting} />
//   acteurs = [{ id, nom, personnage, photo }, ...]  (voir api/detail)
// ============================================================

import { useLangue } from "../lib/langue";

export default function Casting({ acteurs }) {
  const { t } = useLangue();

  // Pas d'acteurs (jeu, livre, ou pas d'info) : on n'affiche rien
  if (!acteurs || acteurs.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-titre text-2xl font-semibold">{t.casting}</h2>

      {/* Rangée défilante : une carte par acteur */}
      <div className="flex gap-4 overflow-x-auto pb-3">
        {acteurs.map((acteur) => (
          <div key={acteur.id} className="w-32 shrink-0 flex flex-col gap-2">
            {acteur.photo ? (
              <img
                src={acteur.photo}
                alt={acteur.nom}
                className="w-32 aspect-[2/3] object-cover rounded-xl bg-carte-2"
              />
            ) : (
              // Pas de photo : on affiche les initiales
              <div className="w-32 aspect-[2/3] rounded-xl bg-carte-2 flex items-center justify-center font-titre text-2xl text-texte-2">
                {acteur.nom
                  .split(" ")
                  .map((mot) => mot[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold leading-snug">{acteur.nom}</p>
              {acteur.personnage && (
                <p className="text-xs text-texte-2 leading-snug mt-0.5 line-clamp-2">
                  {acteur.personnage}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
