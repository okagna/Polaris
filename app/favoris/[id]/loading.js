// ============================================================
// Affiché pendant le chargement de la page d'un favori.
// ------------------------------------------------------------
// Un fichier "loading.js" entoure automatiquement page.js d'un <Suspense>.
// C'est obligatoire ici : avec "cacheComponents" (voir next.config.ts),
// Next.js prépare les pages au moment du build, mais il ne connaît pas
// encore l'[id] de l'adresse. useParams() doit donc "attendre", et Next.js
// affiche ce texte en attendant.
// ============================================================

export default function Chargement() {
  return <p className="text-texte-2">…</p>;
}
