// ============================================================
// ROUTE SERVEUR : catalogue filtrable  (adresse : /api/explorer)
// ------------------------------------------------------------
// Utilisation (tous les paramètres sont optionnels sauf type) :
//   /api/explorer?type=film&genres=28,35&anneeMin=2000&anneeMax=2010
//                &noteMin=7&plateformes=8|119&duree=court
//                &langueOrigine=ja&tri=popularite&page=1&langue=fr
//
// Deux modes :
//   - avec "q" (un titre)  -> recherche par titre (TMDB "search")
//   - sans "q"             -> parcours du catalogue avec les filtres
//                             (TMDB "discover")
// TMDB ne permet pas de mélanger les deux : quand on cherche un titre,
// les filtres (sauf le type) sont ignorés.
// ============================================================

export async function GET(request) {
  const p = new URL(request.url).searchParams;

  const estSerie = p.get("type") === "serie";
  const typeTmdb = estSerie ? "tv" : "movie";
  const langueTmdb = p.get("langue") === "en" ? "en-US" : "fr-FR";
  const q = p.get("q");

  // Les paramètres qu'on va envoyer à TMDB.
  // URLSearchParams construit "?cle=valeur&cle2=valeur2" à notre place.
  const tmdb = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY,
    language: langueTmdb,
    page: p.get("page") || "1",
  });

  let adresse;

  if (q) {
    // ---------- Mode 1 : recherche par titre ----------
    tmdb.set("query", q);
    adresse = `https://api.themoviedb.org/3/search/${typeTmdb}?${tmdb}`;
  } else {
    // ---------- Mode 2 : catalogue avec filtres ----------
    // Le nom du champ "date de sortie" n'est pas le même pour un film et une série
    const champDate = estSerie ? "first_air_date" : "primary_release_date";

    // Tri
    const tris = {
      popularite: "popularity.desc",
      note: "vote_average.desc",
      date: `${champDate}.desc`,
    };
    const tri = p.get("tri") || "popularite";
    tmdb.set("sort_by", tris[tri] || tris.popularite);

    // Trié par note : on exige assez de votes, sinon un film noté 10/10
    // par 2 personnes passerait devant tout le monde
    if (tri === "note") tmdb.set("vote_count.gte", "300");

    // Trié par date : on ne montre pas les films qui ne sont pas encore sortis
    if (tri === "date" && !p.get("anneeMax")) {
      tmdb.set(`${champDate}.lte`, new Date().toISOString().slice(0, 10));
    }

    // Genres : "28,35" = Action ET Comédie
    if (p.get("genres")) tmdb.set("with_genres", p.get("genres"));

    // Années
    if (p.get("anneeMin")) tmdb.set(`${champDate}.gte`, `${p.get("anneeMin")}-01-01`);
    if (p.get("anneeMax")) tmdb.set(`${champDate}.lte`, `${p.get("anneeMax")}-12-31`);

    // Note minimale (avec un minimum de votes pour que la note veuille dire quelque chose)
    if (p.get("noteMin")) {
      tmdb.set("vote_average.gte", p.get("noteMin"));
      if (!tmdb.get("vote_count.gte")) tmdb.set("vote_count.gte", "50");
    }

    // Plateformes : "8|119" = Netflix OU Prime Video, disponibles en France
    if (p.get("plateformes")) {
      tmdb.set("with_watch_providers", p.get("plateformes"));
      tmdb.set("watch_region", "FR");
    }

    // Durée (films seulement : TMDB ne filtre pas bien la durée des séries)
    const duree = p.get("duree");
    if (!estSerie && duree === "court") tmdb.set("with_runtime.lte", "89");
    if (!estSerie && duree === "moyen") {
      tmdb.set("with_runtime.gte", "90");
      tmdb.set("with_runtime.lte", "120");
    }
    if (!estSerie && duree === "long") tmdb.set("with_runtime.gte", "121");

    // Langue d'origine : "ja" = japonais, "ko" = coréen...
    if (p.get("langueOrigine")) tmdb.set("with_original_language", p.get("langueOrigine"));

    adresse = `https://api.themoviedb.org/3/discover/${typeTmdb}?${tmdb}`;
  }

  // Appel à TMDB, avec gestion des erreurs
  try {
    const reponse = await fetch(adresse);
    if (!reponse.ok) {
      return Response.json({ erreur: "tmdb_indisponible" }, { status: 502 });
    }
    const d = await reponse.json();

    // Même format que les tendances, pour réutiliser CartePoster
    const resultats = (d.results || []).map((element) => ({
      tmdb_id: element.id,
      titre: element.title || element.name,
      annee: (element.release_date || element.first_air_date || "").slice(0, 4),
      type: estSerie ? "série" : "film",
      poster: element.poster_path
        ? `https://image.tmdb.org/t/p/w300${element.poster_path}`
        : null,
      resume: element.overview || null,
    }));

    return Response.json({
      resultats,
      page: d.page,
      // TMDB refuse d'aller au-delà de la page 500
      total_pages: Math.min(d.total_pages || 1, 500),
      total: d.total_results || 0,
    });
  } catch (erreur) {
    console.error("Explorer : TMDB injoignable", erreur);
    return Response.json({ erreur: "tmdb_injoignable" }, { status: 502 });
  }
}
