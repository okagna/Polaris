"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";

type Resultat = {
  titre: string;
  annee: string;
  type: string;
  poster?: string | null;
  backdrop?: string | null;
  resume?: string | null;
  tmdb_id?: number | null;
};

export default function Home() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [likedTitles, setLikedTitles] = useState<string[]>([]);
  const [trending, setTrending] = useState<Resultat[]>([]);
  const [trendingWindow, setTrendingWindow] = useState<"day" | "week">("day");
  const trendingRef = useRef<HTMLDivElement>(null);

  function scrollTrending(direction: "left" | "right") {
    trendingRef.current?.scrollBy({
      left: direction === "left" ? -600 : 600,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    async function loadLikes() {
      const { data } = await supabase.from("likes").select("titre");
      if (data) setLikedTitles(data.map((d) => d.titre));
    }
    loadLikes();
  }, []);

  useEffect(() => {
    async function loadTrending() {
      const res = await fetch(`/api/trending?window=${trendingWindow}`);
      const data = await res.json();
      setTrending(data.results || []);
    }
    loadTrending();
  }, [trendingWindow]);

  function handleSearch() {
    if (!description.trim()) return;
    router.push(`/recherche?q=${encodeURIComponent(description.trim())}`);
  }

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

  function Poster({ item }: { item: Resultat }) {
    const liked = likedTitles.includes(item.titre);
    return (
      <div className="relative rounded-lg overflow-hidden shadow-md bg-gray-100 aspect-[2/3]">
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
    );
  }

  const heroImage = trending.find((t) => t.backdrop)?.backdrop;

  return (
    <div>
      {/* Bannière */}
      <section
        className="relative rounded-lg overflow-hidden mb-10"
        style={{
          backgroundImage: heroImage ? `url(${heroImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#032541]/90 to-[#01b4e4]/60" />
        <div className="relative px-8 py-16 text-white">
          <h1 className="text-4xl md:text-5xl font-bold">Bienvenue.</h1>
          <p className="text-xl md:text-2xl font-semibold mt-1 mb-6">
            Retrouve le titre que tu as oublié : film, série, jeu ou livre.
          </p>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Décris ce dont tu te souviens... ex : un film où un mec revit la même journée en boucle"
            rows={3}
            className="w-full p-4 rounded-lg text-gray-800 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#90cea1]"
          />
          <button
            onClick={handleSearch}
            className="mt-4 bg-gradient-to-r from-[#90cea1] to-[#01b4e4] text-[#032541] font-bold px-8 py-2 rounded-full hover:opacity-90"
          >
            Rechercher
          </button>
        </div>
      </section>

      {/* Tendances */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl font-semibold text-[#032541]">Tendances</h2>
          <div className="flex border border-[#032541] rounded-full overflow-hidden text-sm font-semibold">
            <button
              onClick={() => setTrendingWindow("day")}
              className={`px-4 py-1 ${trendingWindow === "day" ? "bg-[#032541] text-[#90cea1]" : "text-[#032541]"}`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setTrendingWindow("week")}
              className={`px-4 py-1 ${trendingWindow === "week" ? "bg-[#032541] text-[#90cea1]" : "text-[#032541]"}`}
            >
              Cette semaine
            </button>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => scrollTrending("left")}
            className="absolute left-0 top-[120px] -translate-y-1/2 z-10 bg-[#032541]/80 hover:bg-[#01b4e4] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-2xl"
            aria-label="Précédent"
          >
            ‹
          </button>

          <div ref={trendingRef} className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
            {trending.map((item) => (
              <div key={`${item.type}-${item.tmdb_id}`} className="w-40 shrink-0">
                <Poster item={item} />
                <h3 className="mt-2 font-semibold text-sm text-[#032541] line-clamp-2">{item.titre}</h3>
                <p className="text-xs text-gray-500">
                  {item.annee} · {item.type}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollTrending("right")}
            className="absolute right-0 top-[120px] -translate-y-1/2 z-10 bg-[#032541]/80 hover:bg-[#01b4e4] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-2xl"
            aria-label="Suivant"
          >
            ›
          </button>
        </div>
      </section>
    </div>
  );
}