"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Favori = {
  id: number;
  tmdb_id: number | null;
  titre: string;
  annee: string;
  type: string;
  poster: string | null;
  resume: string | null;
};

export default function FavoriDetail() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Favori | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) {
        setItem(data);
      }
      setLoading(false);
    }
    fetchItem();
  }, [params.id]);

  if (loading) return <p>Chargement...</p>;
  if (!item) return <p>Favori introuvable.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-blue-600 mb-4">
        ← Retour
      </button>

      <div className="flex gap-6">
        {item.poster && (
          <img src={item.poster} alt={item.titre} className="w-48 rounded-lg shadow" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{item.titre} <span className="text-gray-500 font-normal">({item.annee})</span></h1>
          <span className="text-xs uppercase text-blue-600 font-medium">{item.type}</span>
          <p className="mt-4 text-gray-700">{item.resume || "Résumé non disponible."}</p>
        </div>
      </div>
    </div>
  );
}