export async function POST(request: Request) {
  const { description } = await request.json();

  const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Voici une description vague d'un film, série, jeu vidéo ou livre : "${description}". Propose 5 titres possibles avec leur année et leur type (film, série, jeu vidéo, livre). Réponds UNIQUEMENT en JSON, sous cette forme exacte, sans texte autour : [{"titre": "...", "annee": "...", "type": "..."}]`,
        },
      ],
    }),
  });

  const aiData = await aiResponse.json();
  const text = aiData.content[0].text;
  const suggestions = JSON.parse(text);

  const enriched = await Promise.all(
    suggestions.map(async (item: any) => {
      if (item.type === "film" || item.type === "série") {
        const searchType = item.type === "film" ? "movie" : "tv";
        const tmdbRes = await fetch(
          `https://api.themoviedb.org/3/search/${searchType}?query=${encodeURIComponent(
            item.titre
          )}&api_key=${process.env.TMDB_API_KEY}&language=fr-FR`
        );
        const tmdbData = await tmdbRes.json();
        const match = tmdbData.results?.[0];
        return {
          ...item,
          poster: match?.poster_path
            ? `https://image.tmdb.org/t/p/w300${match.poster_path}`
            : null,
          resume: match?.overview || null,
          tmdb_id: match?.id || null,
        };
      }
      return item;
    })
  );

  return Response.json({ results: enriched });
}