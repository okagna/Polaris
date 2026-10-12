"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Favori = {
  id: number;
  tmdb_id: number | null;
  titre: string;
  annee: string;
  type: string;
  poster: string | null;
  resume: string | null;
};

export default function Favoris() {
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchFavoris() {
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFavoris(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchFavoris();
  }, []);

  async function handleDelete(id: number) {
    const { error } = await supabase.from("likes").delete().eq("id", id);
    if (error) {
      alert("Erreur lors de la suppression");
      console.error(error);
    } else {
      setFavoris(favoris.filter((f) => f.id !== id));
    }
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mes favoris</h1>

      {favoris.length === 0 && (
        <p className="text-gray-500">Aucun favori pour l'instant. Va en ajouter depuis la recherche !</p>
      )}

      <div className="grid gap-4">
        {favoris.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex gap-4 bg-white shadow-sm">
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
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-gray-400 hover:text-red-600 self-start"
              title="Retirer des favoris"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}