export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const window = searchParams.get("window") === "week" ? "week" : "day";

  const res = await fetch(
    `https://api.themoviedb.org/3/trending/all/${window}?api_key=${process.env.TMDB_API_KEY}&language=fr-FR`
  );
  const data = await res.json();

  const results = (data.results || [])
    .filter((m: any) => m.media_type !== "person")
    .map((m: any) => ({
      tmdb_id: m.id,
      titre: m.title || m.name,
      annee: (m.release_date || m.first_air_date || "").slice(0, 4),
      type: m.media_type === "tv" ? "série" : "film",
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w300${m.poster_path}` : null,
      backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
      resume: m.overview || null,
    }));

  return Response.json({ results });
}