// ============================================================
// ROUTE SERVEUR : fiche complète d'un film / série  (adresse : /api/detail)
// ------------------------------------------------------------
// Utilisation : /api/detail?id=603&type=film&langue=fr   ou   ?id=1399&type=série&langue=en
// Renvoie les infos utiles pour la page de détail, casting compris.
// ============================================================

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const typeTmdb = searchParams.get("type") === "série" ? "tv" : "movie";
  // Langue des textes (titre, résumé, genres) : "fr-FR" ou "en-US"
  const langueTmdb = searchParams.get("langue") === "en" ? "en-US" : "fr-FR";

  if (!id) {
    return Response.json({ erreur: "id manquant" }, { status: 400 });
  }

  // "append_to_response=credits" : TMDB ajoute le casting dans la MÊME
  // réponse (champ "credits"), pas besoin de faire un 2e appel.
  const reponse = await fetch(
    `https://api.themoviedb.org/3/${typeTmdb}/${id}?api_key=${process.env.TMDB_API_KEY}&language=${langueTmdb}&append_to_response=credits`
  );

  // Identifiant inconnu chez TMDB
  if (!reponse.ok) {
    return Response.json({ erreur: "introuvable" }, { status: 404 });
  }

  const d = await reponse.json();

  // Casting : les 12 premiers acteurs (TMDB les classe par importance)
  const casting = (d.credits?.cast || []).slice(0, 12).map((acteur) => ({
    id: acteur.id,
    nom: acteur.name,
    personnage: acteur.character || null,
    photo: acteur.profile_path
      ? `https://image.tmdb.org/t/p/w185${acteur.profile_path}`
      : null,
  }));

  return Response.json({
    tmdb_id: d.id,
    titre: d.title || d.name,
    annee: (d.release_date || d.first_air_date || "").slice(0, 4),
    type: typeTmdb === "tv" ? "série" : "film",
    poster: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
    backdrop: d.backdrop_path ? `https://image.tmdb.org/t/p/w1280${d.backdrop_path}` : null,
    resume: d.overview || null,
    genres: (d.genres || []).map((g) => g.name),
    note: d.vote_average ? Math.round(d.vote_average * 10) / 10 : null,
    // Durée : en minutes pour un film, durée d'un épisode pour une série
    duree: d.runtime || d.episode_run_time?.[0] || null,
    casting,
  });
}
