"use client";
import { supabase } from "./lib/supabase";
import { useState, useEffect } from "react";

type Resultat = {
  titre: string;
  annee: string;
  type: string;
  poster?: string | null;
  resume?: string | null;
  tmdb_id?: number | null;
};

export default function Home() {
  const [description, setDescription] = useState("");
  const [results, setResults] = useState<Resultat[]>([]);
  const [loading, setLoading] = useState(false);

// Charger la recherche précédente au montage de la page
useEffect(() => {
  const savedDescription = localStorage.getItem("polaris_description");
  const savedResults = localStorage.getItem("polaris_results");
  if (savedDescription) setDescription(savedDescription);
  if (savedResults) setResults(JSON.parse(savedResults));
}, []);

async function handleLike(item: Resultat) {
  // Vérifie si ce film est déjà dans les favoris
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("tmdb_id", item.tmdb_id)
    .eq("titre", item.titre);

  if (existing && existing.length > 0) {
    alert("Déjà dans tes favoris !");
    return;
  }

  const { error } = await supabase.from("likes").insert({
    tmdb_id: item.tmdb_id,
    titre: item.titre,
    annee: item.annee,
    type: item.type,
    poster: item.poster,
    resume: item.resume,
  });

  if (error) {
    alert("Erreur lors de l'ajout aux favoris");
    console.error(error);
  } else {
    alert("Ajouté aux favoris !");
  }
}

  async function handleSearch() {
    setLoading(true);
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const data = await res.json();
    setResults(data.results || []);
    localStorage.setItem("polaris_description", description);
    localStorage.setItem("polaris_results", JSON.stringify(data.results || []));
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Retrouve ton titre</h1>
      <p className="text-gray-600 mb-6">Décris ce dont tu te souviens, on s'occupe du reste.</p>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ex: un film où un mec revit la même journée en boucle..."
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleSearch}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Recherche en cours..." : "Rechercher"}
      </button>

      <div className="mt-8 grid gap-4">
        {results.map((item, i) => (
  <div key={i} className="border border-gray-200 rounded-lg p-4 flex gap-4 bg-white shadow-sm">
    {item.poster && (
      <img src={item.poster} alt={item.titre} className="w-24 rounded" />
    )}
    <div className="flex-1">
      <h3 className="font-semibold text-lg">{item.titre} <span className="text-gray-500 font-normal">({item.annee})</span></h3>
      <span className="text-xs uppercase text-blue-600 font-medium">{item.type}</span>
      <p className="text-sm text-gray-600 mt-1">
      {item.resume
      ? (item.resume.length > 300 ? item.resume.slice(0, 300) + "..." : item.resume)
      : "Résumé non disponible."}
      </p>
      <button
        onClick={() => handleLike(item)}
        className="mt-2 text-red-500 hover:text-red-700"
      >
        ❤️ Ajouter aux favoris
      </button>
    </div>
  </div>
))}
      </div>
    </div>
  );
}