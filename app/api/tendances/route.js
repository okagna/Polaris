// ============================================================
// ROUTE SERVEUR : films et séries en tendance  (adresse : /api/tendances)
// ------------------------------------------------------------
// Utilisation : /api/tendances?periode=jour&langue=fr   ou   ?periode=semaine&langue=en
// Interroge TMDB et renvoie une liste simplifiée, prête à afficher.
// ============================================================

export async function GET(request) {
  // Lit la période et la langue demandées dans l'adresse
  const { searchParams } = new URL(request.url);
  const periodeTmdb = searchParams.get("periode") === "semaine" ? "week" : "day";
  // TMDB attend un code comme "fr-FR" ou "en-US"
  const langueTmdb = searchParams.get("langue") === "en" ? "en-US" : "fr-FR";

  // Demande à TMDB les tendances (films + séries + personnes)
  const reponse = await fetch(
    `https://api.themoviedb.org/3/trending/all/${periodeTmdb}?api_key=${process.env.TMDB_API_KEY}&language=${langueTmdb}`
  );
  const donnees = await reponse.json();

  const resultats = (donnees.results || [])
    // On enlève les "personnes" (acteurs), on garde films et séries
    .filter((element) => element.media_type !== "person")
    // On garde seulement les champs utiles, avec les noms de notre site
    .map((element) => ({
      tmdb_id: element.id,
      titre: element.title || element.name, // "title" pour un film, "name" pour une série
      annee: (element.release_date || element.first_air_date || "").slice(0, 4),
      type: element.media_type === "tv" ? "série" : "film",
      poster: element.poster_path
        ? `https://image.tmdb.org/t/p/w300${element.poster_path}`
        : null,
      backdrop: element.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${element.backdrop_path}`
        : null,
      resume: element.overview || null,
    }));

  return Response.json({ resultats });
}
