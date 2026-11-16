// ============================================================
// Gestion des favoris (les "likes" du cœur)
// ------------------------------------------------------------
// Ce "hook" regroupe la logique des favoris, pour ne pas la recopier
// dans chaque page (accueil, résultats de recherche).
//
// Utilisation dans un composant :
//   const { titresAimes, basculerFavori } = useFavoris();
//   - titresAimes    : la liste des titres déjà en favoris
//   - basculerFavori : ajoute le titre s'il n'y est pas, le retire sinon
// ============================================================

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useFavoris() {
  // Liste des titres qui sont déjà dans les favoris (sert à colorer le cœur)
  const [titresAimes, setTitresAimes] = useState([]);

  // Au chargement : on lit la table "likes" pour savoir ce qui est déjà aimé
  useEffect(() => {
    async function chargerTitresAimes() {
      const { data } = await supabase.from("likes").select("titre");
      if (data) setTitresAimes(data.map((ligne) => ligne.titre));
    }
    chargerTitresAimes();
  }, []);

  // Clic sur le cœur : ajoute ou retire le favori
  async function basculerFavori(element) {
    const dejaAime = titresAimes.includes(element.titre);

    if (dejaAime) {
      // Déjà en favoris -> on le supprime de la base
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("tmdb_id", element.tmdb_id)
        .eq("titre", element.titre);

      if (!error) {
        setTitresAimes((avant) => avant.filter((titre) => titre !== element.titre));
      } else {
        console.error(error);
      }
    } else {
      // Pas encore en favoris -> on l'ajoute dans la base
      const { error } = await supabase.from("likes").insert({
        tmdb_id: element.tmdb_id,
        titre: element.titre,
        annee: element.annee,
        type: element.type,
        poster: element.poster,
        resume: element.resume,
      });

      if (!error) {
        setTitresAimes((avant) => [...avant, element.titre]);
      } else {
        console.error(error);
      }
    }
  }

  return { titresAimes, basculerFavori };
}
