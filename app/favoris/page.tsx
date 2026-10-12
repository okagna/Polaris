"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Like = {
  id: number;
  tmdb_id: number | null;
  titre: string;
  annee: string;
  type: string;
  poster: string | null;
};

export default function Favoris() {
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikes();
  }, []);

  async function fetchLikes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLikes(data);
    }
    setLoading(false);
  }

  async function handleRemove(id: number) {
    await supabase.from("likes").delete().eq("id", id);
    setLikes(likes.filter((l) => l.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mes favoris</h1>

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && likes.length === 0 && (
        <p className="text-gray-500">Aucun favori pour l'instant.</p>
      )}

      <div className="grid gap-4">
        {likes.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex gap-4 bg-white shadow-sm">
            {item.poster && (
              <img src={item.poster} alt={item.titre} className="w-24 rounded" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.titre} <span className="text-gray-500 font-normal">({item.annee})</span></h3>
              <span className="text-xs uppercase text-blue-600 font-medium">{item.type}</span>
              <button
                onClick={() => handleRemove(item.id)}
                className="block mt-2 text-sm text-gray-400 hover:text-red-600"
              >
                Retirer des favoris
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}