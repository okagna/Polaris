"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Resultat = {
  titre: string;
  annee: string;
  type: string;
  poster?: string | null;
  resume?: string | null;
  tmdb_id?: number | null;
};

function Resultats() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState<Resultat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [likedTitles, setLikedTitles] = useState<string[]>([]);

  useEffect(() => {
    async function loadLikes() {
      const { data } = await supabase.from("likes").select("titre");
      if (data) setLikedTitles(data.map((d) => d.titre));
    }
    loadLikes();
  }, []);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }
    async function run() {
      setLoading(true);
      setError(false);
      const cacheKey = `polaris_q_${q}`;

      // Évite de refaire (et repayer) la même recherche à chaque F5
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          setResults(JSON.parse(cached));
          setLoading(false);
          return;
        }
      } catch {}

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: q }),
        });
        const data = await res.json();
        const unique = (data.results || []).filter(
          (item: Resultat, index: number, self: Resultat[]) =>
            index === self.findIndex((t) => t.titre === item.titre)
        );
        setResults(unique);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(unique));
        } catch {}
      } catch (e) {
        console.error(e);
        setError(true);
      }
      setLoading(false);
    }
    run();
  }, [q]);

  async function handleLike(item: Resultat) {
    const isLiked = likedTitles.includes(item.titre);
    if (isLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("tmdb_id", item.tmdb_id)
        .eq("titre", item.titre);
      if (!error) setLikedTitles((prev) => prev.filter((t) => t !== item.titre));
      else console.error(error);
    } else {
      const { error } = await supabase.from("likes").insert({
        tmdb_id: item.tmdb_id,
        titre: item.titre,
        annee: item.annee,
        type: item.type,
        poster: item.poster,
        resume: item.resume,
      });
      if (!error) setLikedTitles((prev) => [...prev, item.titre]);
      else console.error(error);
    }
  }

  return (
    <div>
      <Link href="/" className="text-[#01b4e4] font-medium">
        ← Nouvelle recherche
      </Link>

      <h1 className="text-2xl font-bold text-[#032541] mt-4 mb-1">Résultats</h1>
      <p className="text-gray-600 mb-6">« {q} »</p>

      {loading && <p>Recherche en cours...</p>}
      {error && <p className="text-red-600">Une erreur est survenue, réessaie.</p>}
      {!loading && !error && results.length === 0 && <p>Aucun résultat.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((item, i) => {
          const liked = likedTitles.includes(item.titre);
          return (
            <div key={i}>
              <div className="relative rounded-lg overflow-hidden shadow-sm bg-gray-100 aspect-[2/3]">
                {item.poster ? (
                  <img src={item.poster} alt={item.titre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm p-2 text-center">
                    Pas d'affiche
                  </div>
                )}
                <button
                  onClick={() => handleLike(item)}
                  className={`absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center transition ${
                    liked ? "bg-red-600 text-white" : "bg-[#032541]/80 text-white hover:bg-[#01b4e4]"
                  }`}
                  title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  ❤
                </button>
              </div>
              <h3 className="mt-2 font-semibold text-sm text-[#032541] line-clamp-2">{item.titre}</h3>
              <p className="text-xs text-gray-500">
                {item.annee} · {item.type}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RecherchePage() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <Resultats />
    </Suspense>
  );
}