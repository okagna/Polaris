// ============================================================
// ROUTE SERVEUR : options des filtres  (adresse : /api/filtres)
// ------------------------------------------------------------
// Utilisation : /api/filtres?type=film&langue=fr   ou   ?type=serie&langue=en
// Renvoie les listes qui remplissent les cases à cocher de la page Explorer :
//   - genres      : [{ id, nom }]          (pas les mêmes pour films et séries)
//   - plateformes : [{ id, nom, logo }]    (les plus connues en France)
// ============================================================

// Combien de plateformes on propose (les plus populaires en France)
const NOMBRE_PLATEFORMES = 20;

export async function GET(request) {
  const p = new URL(request.url).searchParams;
  const typeTmdb = p.get("type") === "serie" ? "tv" : "movie";
  const langueTmdb = p.get("langue") === "en" ? "en-US" : "fr-FR";
  const cle = process.env.TMDB_API_KEY;

  try {
    // Promise.all : on lance les DEUX appels en même temps, et on attend
    // qu'ils soient finis tous les deux (plus rapide que l'un après l'autre)
    const [reponseGenres, reponsePlateformes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/genre/${typeTmdb}/list?api_key=${cle}&language=${langueTmdb}`),
      fetch(`https://api.themoviedb.org/3/watch/providers/${typeTmdb}?api_key=${cle}&language=${langueTmdb}&watch_region=FR`),
    ]);

    const donneesGenres = await reponseGenres.json();
    const donneesPlateformes = await reponsePlateformes.json();

    const genres = (donneesGenres.genres || []).map((g) => ({ id: g.id, nom: g.name }));

    // TMDB donne pour chaque plateforme un "ordre d'affichage" par pays :
    // plus le chiffre est petit, plus la plateforme est connue en France
    const plateformes = (donneesPlateformes.results || [])
      .sort(
        (a, b) =>
          (a.display_priorities?.FR ?? 999) - (b.display_priorities?.FR ?? 999)
      )
      .slice(0, NOMBRE_PLATEFORMES)
      .map((pl) => ({
        id: pl.provider_id,
        nom: pl.provider_name,
        logo: pl.logo_path ? `https://image.tmdb.org/t/p/w92${pl.logo_path}` : null,
      }));

    return Response.json({ genres, plateformes });
  } catch (erreur) {
    console.error("Filtres : TMDB injoignable", erreur);
    return Response.json({ genres: [], plateformes: [] }, { status: 502 });
  }
}
