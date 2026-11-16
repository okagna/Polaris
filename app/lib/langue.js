"use client";
// ============================================================
// Gestion de la langue de l'interface (français / anglais)
// ------------------------------------------------------------
// - FournisseurLangue : à placer autour de l'application (voir layout.js)
// - useLangue()       : à appeler dans un composant pour connaître la
//                       langue et récupérer les textes traduits
//   Exemple :  const { langue, changerLangue, t } = useLangue();
//              <p>{t.recherche}</p>
//
// Pour ajouter un texte : ajoute la même clé dans "fr" ET dans "en".
// Certains textes sont des FONCTIONS (ex : t.titresTrouves(3)) parce
// qu'ils changent selon un nombre (1 titre / 3 titres).
// ============================================================

import { createContext, useContext, useEffect, useState } from "react";

// Tous les textes traduits, rangés par langue
export const textes = {
  fr: {
    // En-tête
    recherche: "Recherche",
    favoris: "Favoris",

    // Accueil
    accroche: "Recherche par souvenir",
    titreAccueil: "Tu te souviens de l'histoire, pas du titre ?",
    sousTitre: "Décris ce dont tu te souviens. Polaris retrouve le film, la série, le jeu ou le livre.",
    labelDescription: "Décris ce dont tu te souviens",
    exemple: "ex : un film où un mec revit la même journée en boucle",
    aideClavier: "Entrée pour lancer · Maj + Entrée pour aller à la ligne",
    boutonRechercher: "Rechercher",
    essaie: "Essaie :",
    exemples: [
      "Un mec revit la même journée en boucle",
      "Une série avec un hôtel hanté",
      "Un jeu où on construit une ville sur Mars",
    ],
    tendances: "Tendances",
    aujourdhui: "Aujourd'hui",
    cetteSemaine: "Cette semaine",
    precedent: "Précédent",
    suivant: "Suivant",

    // Résultats
    retourAccueil: "Retour à l'accueil",
    resultats: "Résultats",
    titresTrouves: (n) => `${n} ${n > 1 ? "titres trouvés" : "titre trouvé"}`,
    rechercheEnCours: "Recherche en cours...",
    erreur: "Une erreur est survenue, réessaie.",
    aucunResultat: "Aucun résultat. Essaie d'ajouter des détails.",
    chargement: "Chargement...",

    // Cartes
    pasAffiche: "Pas d'affiche",
    ajouterFavori: "Ajouter aux favoris",
    retirerFavori: "Retirer des favoris",

    // Détail
    retour: "Retour",
    ficheIntrouvable: "Fiche introuvable.",
    resumeIndispo: "Résumé non disponible.",
    casting: "Casting",
    ouRegarder: "Où regarder",
    pays: "France",
    recherchePlateformes: "Recherche des plateformes...",
    aucunePlateforme: "Aucune plateforme trouvée en France.",
    abonnement: "Abonnement",
    location: "Location",
    achat: "Achat",
    voirDetails: "Voir tous les détails →",
    sourcePlateformes: "Données fournies par JustWatch via TMDB.",

    // Favoris
    mesFavoris: "Mes favoris",
    nbTitres: (n) => `${n} ${n > 1 ? "titres" : "titre"}`,
    aucunFavori: "Aucun favori pour l'instant",
    aucunFavoriAide: "Touche le cœur d'un titre pour le retrouver ici.",
    lancerRecherche: "Lancer une recherche",
    favoriIntrouvable: "Favori introuvable.",
    erreurSuppression: "Erreur lors de la suppression",

    // Explorer
    explorer: "Explorer",
    explorerTitre: "Explorer le catalogue",
    explorerSousTitre: "Films et séries, filtrés comme tu veux.",
    chercherTitre: "Chercher un titre…",
    filtres: "Filtres",
    reinitialiser: "Réinitialiser",
    type: "Type",
    films: "Films",
    series: "Séries",
    genres: "Genres",
    chercherGenre: "Rechercher un genre…",
    annee: "Année",
    anneeDe: "De (ex : 1990)",
    anneeA: "À (ex : 2024)",
    noteMin: "Note minimale",
    toutes: "Toutes",
    plateformesFiltre: "Plateformes en France",
    duree: "Durée",
    dureeCourt: "Moins de 1 h 30",
    dureeMoyen: "1 h 30 à 2 h",
    dureeLong: "Plus de 2 h",
    langueOrigine: "Langue d'origine",
    langues: { fr: "Français", en: "Anglais", ja: "Japonais", ko: "Coréen", es: "Espagnol", it: "Italien", de: "Allemand", hi: "Hindi" },
    trierPar: "Trier par",
    triPopularite: "Popularité",
    triNote: "Mieux notés",
    triDate: "Plus récents",
    chargerPlus: "Charger plus",
    aucunTitre: "Aucun titre ne correspond à ces filtres.",
    filtresIgnores: "Recherche par titre : les filtres (sauf le type) sont ignorés.",
    voirResultats: "Voir les résultats",

    // Noms des types (les types sont toujours stockés en français)
    types: { film: "Film", "série": "Série", "jeu vidéo": "Jeu vidéo", livre: "Livre" },
  },

  en: {
    recherche: "Search",
    favoris: "Favorites",

    accroche: "Search by memory",
    titreAccueil: "You remember the story, not the title?",
    sousTitre: "Describe what you remember. Polaris finds the movie, series, game or book.",
    labelDescription: "Describe what you remember",
    exemple: "e.g. a movie where a guy relives the same day over and over",
    aideClavier: "Enter to search · Shift + Enter for a new line",
    boutonRechercher: "Search",
    essaie: "Try:",
    exemples: [
      "A guy relives the same day over and over",
      "A series set in a haunted hotel",
      "A game where you build a city on Mars",
    ],
    tendances: "Trending",
    aujourdhui: "Today",
    cetteSemaine: "This week",
    precedent: "Previous",
    suivant: "Next",

    retourAccueil: "Back to home",
    resultats: "Results",
    titresTrouves: (n) => `${n} ${n > 1 ? "titles found" : "title found"}`,
    rechercheEnCours: "Searching...",
    erreur: "Something went wrong, please try again.",
    aucunResultat: "No results. Try adding more details.",
    chargement: "Loading...",

    pasAffiche: "No poster",
    ajouterFavori: "Add to favorites",
    retirerFavori: "Remove from favorites",

    retour: "Back",
    ficheIntrouvable: "Title not found.",
    resumeIndispo: "No synopsis available.",
    casting: "Cast",
    ouRegarder: "Where to watch",
    pays: "France",
    recherchePlateformes: "Looking for platforms...",
    aucunePlateforme: "No platform found in France.",
    abonnement: "Stream",
    location: "Rent",
    achat: "Buy",
    voirDetails: "See all details →",
    sourcePlateformes: "Data provided by JustWatch via TMDB.",

    mesFavoris: "My favorites",
    nbTitres: (n) => `${n} ${n > 1 ? "titles" : "title"}`,
    aucunFavori: "No favorites yet",
    aucunFavoriAide: "Tap the heart on a title to find it here.",
    lancerRecherche: "Start a search",
    favoriIntrouvable: "Favorite not found.",
    erreurSuppression: "Error while deleting",

    explorer: "Explore",
    explorerTitre: "Explore the catalog",
    explorerSousTitre: "Movies and series, filtered your way.",
    chercherTitre: "Search a title…",
    filtres: "Filters",
    reinitialiser: "Reset",
    type: "Type",
    films: "Movies",
    series: "Series",
    genres: "Genres",
    chercherGenre: "Search a genre…",
    annee: "Year",
    anneeDe: "From (e.g. 1990)",
    anneeA: "To (e.g. 2024)",
    noteMin: "Minimum rating",
    toutes: "All",
    plateformesFiltre: "Platforms in France",
    duree: "Runtime",
    dureeCourt: "Under 1h30",
    dureeMoyen: "1h30 to 2h",
    dureeLong: "Over 2h",
    langueOrigine: "Original language",
    langues: { fr: "French", en: "English", ja: "Japanese", ko: "Korean", es: "Spanish", it: "Italian", de: "German", hi: "Hindi" },
    trierPar: "Sort by",
    triPopularite: "Popularity",
    triNote: "Top rated",
    triDate: "Newest",
    chargerPlus: "Load more",
    aucunTitre: "No title matches these filters.",
    filtresIgnores: "Title search: filters (except type) are ignored.",
    voirResultats: "See results",

    types: { film: "Movie", "série": "Series", "jeu vidéo": "Video game", livre: "Book" },
  },
};

// Le "contexte" : une boîte partagée que tous les composants peuvent lire.
// Les valeurs ci-dessous servent seulement par défaut.
const ContexteLangue = createContext({
  langue: "fr",
  changerLangue: () => {},
  t: textes.fr,
});

// Composant qui fournit la langue à toute l'application
export function FournisseurLangue({ children }) {
  const [langue, setLangue] = useState("fr");

  // Au chargement de la page : on récupère la langue choisie la dernière fois
  useEffect(() => {
    const sauvegardee = localStorage.getItem("polaris_langue");
    if (sauvegardee === "fr" || sauvegardee === "en") setLangue(sauvegardee);
  }, []);

  // Met à jour l'attribut lang de la page (<html lang="en">), utile pour
  // les lecteurs d'écran et la traduction automatique du navigateur
  useEffect(() => {
    document.documentElement.lang = langue;
  }, [langue]);

  // Change la langue ET la mémorise dans le navigateur
  function changerLangue(nouvelleLangue) {
    setLangue(nouvelleLangue);
    localStorage.setItem("polaris_langue", nouvelleLangue);
  }

  return (
    <ContexteLangue.Provider value={{ langue, changerLangue, t: textes[langue] }}>
      {children}
    </ContexteLangue.Provider>
  );
}

// Raccourci pour lire la langue dans n'importe quel composant
export function useLangue() {
  return useContext(ContexteLangue);
}

// Traduit un type ("film", "série"...) pour l'affichage.
// Si le type est inconnu, on l'affiche tel quel.
export function nomType(t, type) {
  return t.types[type] || type;
}
