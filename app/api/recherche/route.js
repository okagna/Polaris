// ============================================================
// ROUTE SERVEUR : recherche par description  (adresse : /api/recherche)
// ------------------------------------------------------------
// Ce code s'exécute côté SERVEUR (jamais dans le navigateur), c'est pour
// ça qu'on peut y utiliser les clés secrètes sans qu'on puisse les voler.
//
// Étapes :
//   1. on reçoit la description écrite par l'utilisateur (+ la langue)
//   2. on demande à Claude de proposer 5 titres possibles
//   3. pour chaque film / série, on récupère affiche et résumé sur TMDB
//   4. on renvoie la liste complète au navigateur
// ============================================================

export async function POST(request) {
  // 1. La description et la langue envoyées par la page de recherche
  const { description, langue } = await request.json();
  const enAnglais = langue === "en";
  const langueTmdb = enAnglais ? "en-US" : "fr-FR";

  // 2. Demande à l'IA (Claude) de proposer des titres, en JSON.
  // Les titres sont demandés dans la langue de l'utilisateur, mais le
  // "type" reste TOUJOURS en français : le reste du code s'en sert.
  const reponseIA = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY, // clé secrète (.env.local)
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Voici une description vague d'un film, série, jeu vidéo ou livre : "${description}". Propose 5 titres possibles avec leur année et leur type. Donne les titres ${
            enAnglais ? "en anglais (titre anglais officiel)" : "en français (titre français officiel s'il existe)"
          }. Le champ "type" doit être EXACTEMENT l'un de ces mots : film, série, jeu vidéo, livre. Réponds UNIQUEMENT en JSON, sous cette forme exacte, sans texte autour : [{"titre": "...", "annee": "...", "type": "..."}]`,
        },
      ],
    }),
  });

  // On lit la réponse de l'IA et on la transforme en vraie liste JavaScript
  const donneesIA = await reponseIA.json();
  const texte = donneesIA.content[0].text;
  const suggestions = JSON.parse(texte);

  // 3. Pour chaque suggestion, on complète avec les infos de TMDB
  const enrichis = await Promise.all(
    suggestions.map(async (element) => {
      // TMDB ne connaît que les films et les séries (pas les jeux / livres)
      if (element.type === "film" || element.type === "série") {
        const typeTmdb = element.type === "film" ? "movie" : "tv";

        const reponseTmdb = await fetch(
          `https://api.themoviedb.org/3/search/${typeTmdb}?query=${encodeURIComponent(
            element.titre
          )}&api_key=${process.env.TMDB_API_KEY}&language=${langueTmdb}`
        );
        const donneesTmdb = await reponseTmdb.json();
        const trouve = donneesTmdb.results?.[0]; // premier résultat de TMDB

        return {
          ...element,
          poster: trouve?.poster_path
            ? `https://image.tmdb.org/t/p/w300${trouve.poster_path}`
            : null,
          resume: trouve?.overview || null,
          tmdb_id: trouve?.id || null,
        };
      }

      // Jeux vidéo et livres : on les renvoie tels quels
      return element;
    })
  );

  // 4. On renvoie le tout au navigateur
  return Response.json({ resultats: enrichis });
}
