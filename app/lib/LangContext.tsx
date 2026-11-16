"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "fr" | "en";

export const texts = {
  fr: {
    search: "Recherche",
    favorites: "Favoris",
    welcome: "Bienvenue.",
    subtitle: "Retrouve le titre que tu as oublié : film, série, jeu ou livre.",
    placeholder: "Décris ce dont tu te souviens... ex : un film où un mec revit la même journée en boucle",
    searchBtn: "Rechercher",
    searching: "Recherche en cours...",
    results: "Résultats",
    trending: "Tendances",
    today: "Aujourd'hui",
    thisWeek: "Cette semaine",
  },
  en: {
    search: "Search",
    favorites: "Favorites",
    welcome: "Welcome.",
    subtitle: "Find the title you forgot: movie, series, game or book.",
    placeholder: "Describe what you remember... e.g. a movie where a guy relives the same day over and over",
    searchBtn: "Search",
    searching: "Searching...",
    results: "Results",
    trending: "Trending",
    today: "Today",
    thisWeek: "This week",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: typeof texts.fr };

const LangContext = createContext<Ctx>({
  lang: "fr",
  setLang: () => {},
  t: texts.fr,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("polaris_lang");
    if (saved === "fr" || saved === "en") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("polaris_lang", l);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: texts[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}