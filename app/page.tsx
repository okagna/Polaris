"use client";
import { useState } from "react";

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

  async function handleSearch() {
    setLoading(true);
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Polaris</h1>
      <p>Décris ce dont tu te souviens, on t'aide à retrouver le titre.</p>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ex: un film où un mec revit la même journée en boucle..."
        rows={4}
        style={{ width: "100%", padding: "0.5rem" }}
      />

      <button onClick={handleSearch} disabled={loading} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        {loading ? "Recherche en cours..." : "Rechercher"}
      </button>

      <div style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
        {results.map((item, i) => (
          <div key={i} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
            <strong>{item.titre}</strong> ({item.annee}) — {item.type}
            {item.poster && (
              <img src={item.poster} alt={item.titre} style={{ maxWidth: "150px", display: "block", marginTop: "0.5rem" }} />
            )}
            {item.resume && <p>{item.resume}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}