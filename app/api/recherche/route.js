// ============================================================
// ROUTE SERVEUR : recherche par description  (adresse : /api/recherche)
// ------------------------------------------------------------
// Ce code s'exécute côté SERVEUR (jamais dans le navigateur), c'est pour
// ça qu'on peut y utiliser les clés secrètes sans qu'on puisse les voler.
//
// Étapes :
//   1. on reçoit la description écrite par l'utilisateur (+ la langue)
//   2. on demande à Claude de proposer NOMBRE_TITRES titres possibles
//   3. pour chaque film / série, on récupère affiche et résumé sur TMDB
//   4. on renvoie la liste complète au navigateur
// ============================================================

// Nombre de titres demandés à l'IA : change ce chiffre pour en avoir plus ou moins.
// Plus il est grand, plus la recherche est lente et coûte cher.
const NOMBRE_TITRES = 10;

export async function POST(request) {
  // 1. La description et la langue envoyées par la page de recherche
  const { description, langue } = await request.json();
  const enAnglais = langue === "en";
  const langueTmdb = enAnglais ? "en-US" : "fr-FR";

  // 2. Demande à l'IA (Claude) de proposer des titres, en JSON.
  // Les titres sont demandés dans la langue de l'utilisateur, mais le
  // "type" reste TOUJOURS en français : le reste du code s'en sert.
  // Si le réseau est coupé, fetch lui-même lance une erreur : on l'attrape
  // avec ".catch" et on obtient null au lieu de faire planter la route
  const reponseIA = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY, // clé secrète (.env.local)
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      // Longueur max de la réponse : environ 100 "tokens" par titre, plus de la marge
      max_tokens: 150 * NOMBRE_TITRES,
      messages: [
        {
          role: "user",
          content: `Voici une description vague d'un film, série, jeu vidéo ou livre : "${description}". Propose ${NOMBRE_TITRES} titres possibles, du plus probable au moins probable, avec leur année et leur type. Donne les titres ${
            enAnglais ? "en anglais (titre anglais officiel)" : "en français (titre français officiel s'il existe)"
          }. Le champ "type" doit être EXACTEMENT l'un de ces mots : film, série, jeu vidéo, livre. Réponds UNIQUEMENT en JSON, sous cette forme exacte, sans texte autour : [{"titre": "...", "annee": "...", "type": "..."}]`,
        },
      ],
    }),
  }).catch((erreur) => {
    console.error("Impossible de joindre l'IA :", erreur);
    return null;
  });

  // L'IA n'a pas répondu correctement (réseau, clé invalide, quota, panne...)
  if (!reponseIA || !reponseIA.ok) {
    if (reponseIA) console.error("Erreur de l'IA :", reponseIA.status, await reponseIA.text());
    return Response.json({ erreur: "ia_indisponible" }, { status: 502 });
  }

  // On lit la réponse de l'IA et on la transforme en vraie liste JavaScript.
  // try / catch : si quelque chose plante dans le "try", on saute
  // directement dans le "catch" au lieu de faire planter toute la route.
  let suggestions;
  try {
    const donneesIA = await reponseIA.json();
    const texte = donneesIA.content[0].text;

    // L'IA ajoute parfois du texte autour du JSON ("Voici les titres : [...]").
    // On garde seulement ce qui est entre le premier "[" et le dernier "]".
    const debut = texte.indexOf("[");
    const fin = texte.lastIndexOf("]");
    suggestions = JSON.parse(texte.slice(debut, fin + 1));

    // On vérifie qu'on a bien reçu une liste
    if (!Array.isArray(suggestions)) throw new Error("Pas une liste");
  } catch (erreur) {
    console.error("Réponse de l'IA illisible :", erreur);
    return Response.json({ erreur: "reponse_illisible" }, { status: 502 });
  }

  // 3. Pour chaque suggestion, on complète avec les infos de TMDB
  const enrichis = await Promise.all(
    suggestions.map(async (element) => {
      // TMDB ne connaît que les films et les séries (pas les jeux / livres)
      if (element.type === "film" || element.type === "série") {
        const typeTmdb = element.type === "film" ? "movie" : "tv";

        // Si TMDB plante pour UN titre, on garde quand même ce titre
        // (sans affiche) au lieu de faire échouer toute la recherche
        try {
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
        } catch (erreur) {
          console.error(`TMDB indisponible pour "${element.titre}" :`, erreur);
          return element;
        }
      }

      // Jeux vidéo et livres : on les renvoie tels quels
      return element;
    })
  );

  // 4. On renvoie le tout au navigateur
  return Response.json({ resultats: enrichis });
}
