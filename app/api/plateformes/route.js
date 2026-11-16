// ============================================================
// ROUTE SERVEUR : où regarder un film / une série  (adresse : /api/plateformes)
// ------------------------------------------------------------
// Utilisation : /api/plateformes?id=603&type=film   ou   ?id=1399&type=série
// Interroge TMDB (données JustWatch) et renvoie les plateformes
// disponibles en France, classées en 3 catégories.
// ============================================================

export async function GET(request) {
  // Lit l'identifiant TMDB et le type dans l'adresse
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const typeTmdb = searchParams.get("type") === "série" ? "tv" : "movie";

  // Sans identifiant, on ne peut rien chercher
  if (!id) {
    return Response.json({ erreur: "id manquant" }, { status: 400 });
  }

  // Demande à TMDB les plateformes pour ce film / cette série
  const reponse = await fetch(
    `https://api.themoviedb.org/3/${typeTmdb}/${id}/watch/providers?api_key=${process.env.TMDB_API_KEY}`
  );
  const donnees = await reponse.json();

  // On ne garde que la France ("FR"). S'il n'y a rien, on prend un objet vide.
  const france = donnees.results?.FR || {};

  // Transforme une liste TMDB en liste simple { nom, logo }
  function simplifier(liste) {
    return (liste || []).map((plateforme) => ({
      nom: plateforme.provider_name,
      logo: plateforme.logo_path
        ? `https://image.tmdb.org/t/p/w92${plateforme.logo_path}`
        : null,
    }));
  }

  return Response.json({
    lien: france.link || null, // page TMDB/JustWatch avec tous les détails
    abonnement: simplifier(france.flatrate), // Netflix, Disney+...
    location: simplifier(france.rent), // louer
    achat: simplifier(france.buy), // acheter
  });
}
