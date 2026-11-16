"use client";
// ============================================================
// PAGE EXPLORER  (adresse : /explorer)
// ------------------------------------------------------------
// Le catalogue de films et séries, avec des filtres à gauche
// (type, genres, année, note, plateformes, durée, langue, tri) et une
// grille d'affiches à droite. En haut : un champ pour chercher un titre.
//
// Les données viennent de deux routes :
//   - /api/filtres  : les genres et plateformes à proposer
//   - /api/explorer : les films / séries qui correspondent aux filtres
// ============================================================

import { useEffect, useState } from "react";
import { useLangue } from "../lib/langue";
import { useFavoris } from "../lib/favoris";
import CartePoster from "../composants/CartePoster";

// Les filtres au départ (et après "Réinitialiser")
const FILTRES_VIDES = {
  type: "film", // "film" ou "serie"
  q: "", // titre recherché
  genres: [], // identifiants TMDB des genres cochés
  anneeMin: "",
  anneeMax: "",
  noteMin: "", // "" = toutes, sinon "6", "7" ou "8"
  plateformes: [], // identifiants TMDB des plateformes cochées
  duree: "", // "", "court", "moyen" ou "long" (films seulement)
  langueOrigine: "", // "", "fr", "en", "ja"...
  tri: "popularite", // "popularite", "note" ou "date"
};

// Codes des langues proposées (les noms sont dans lib/langue.js)
const LANGUES_ORIGINE = ["fr", "en", "ja", "ko", "es", "it", "de", "hi"];

// ---------- Petits composants réutilisés dans la page ----------

// Un bloc de filtres : un titre + son contenu
function Section({ titre, children }) {
  return (
    <section className="bg-carte border border-bordure rounded-2xl p-4 flex flex-col gap-3">
      <h2 className="text-xs font-bold tracking-widest uppercase text-texte-2">{titre}</h2>
      {children}
    </section>
  );
}

// Une case à cocher (ou un bouton radio) avec un style de carte
function Option({ coche, onChange, type = "checkbox", name, children }) {
  return (
    <label
      className={`flex items-center gap-3 min-h-11 px-3 rounded-lg border cursor-pointer transition ${
        coche
          ? "border-accent/50 bg-accent/10 text-texte"
          : "border-bordure bg-carte-2/40 text-clair hover:border-texte-3"
      }`}
    >
      <input type={type} name={name} checked={coche} onChange={onChange} className="w-4 h-4 accent-accent shrink-0" />
      <span className="text-sm flex items-center gap-2 min-w-0">{children}</span>
    </label>
  );
}

// Style commun des petits champs (années) et des listes déroulantes
const styleChamp =
  "w-full h-11 px-3 rounded-lg bg-fond border border-bordure text-texte text-sm focus:outline-none focus:border-accent/60";

export default function PageExplorer() {
  const { langue, t } = useLangue();
  const { titresAimes, basculerFavori } = useFavoris();

  const [filtres, setFiltres] = useState(FILTRES_VIDES);
  // Ce qui est tapé dans le champ titre (on attend un peu avant de chercher)
  const [titreTape, setTitreTape] = useState("");
  // Les genres et plateformes proposés (chargés depuis /api/filtres)
  const [options, setOptions] = useState({ genres: [], plateformes: [] });
  const [rechercheGenre, setRechercheGenre] = useState("");

  const [resultats, setResultats] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(false);

  // Sur téléphone, les filtres sont cachés derrière un bouton
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  // ---------- Modifier les filtres ----------

  // Change un seul filtre, ex : changer("tri", "note")
  function changer(cle, valeur) {
    setFiltres((avant) => ({ ...avant, [cle]: valeur }));
  }

  // Coche / décoche un élément d'une liste (genres ou plateformes)
  function basculer(cle, id) {
    setFiltres((avant) => ({
      ...avant,
      [cle]: avant[cle].includes(id)
        ? avant[cle].filter((x) => x !== id)
        : [...avant[cle], id],
    }));
  }

  // Changer de type : les genres ne sont pas les mêmes pour films et séries,
  // donc on les décoche ; la durée ne s'applique qu'aux films
  function changerType(type) {
    setFiltres((avant) => ({ ...avant, type, genres: [], duree: type === "serie" ? "" : avant.duree }));
  }

  function reinitialiser() {
    setFiltres(FILTRES_VIDES);
    setTitreTape("");
    setRechercheGenre("");
  }

  // Nombre de filtres actifs (affiché sur le bouton "Filtres" du téléphone)
  const nbFiltresActifs =
    filtres.genres.length +
    filtres.plateformes.length +
    (filtres.anneeMin ? 1 : 0) +
    (filtres.anneeMax ? 1 : 0) +
    (filtres.noteMin ? 1 : 0) +
    (filtres.duree ? 1 : 0) +
    (filtres.langueOrigine ? 1 : 0);

  // ---------- Chargement des données ----------

  // "Debounce" : on attend 400 ms après la dernière touche avant de chercher,
  // pour ne pas appeler TMDB à chaque lettre tapée
  useEffect(() => {
    const minuteur = setTimeout(() => changer("q", titreTape.trim()), 400);
    return () => clearTimeout(minuteur); // annule si on retape avant 400 ms
  }, [titreTape]);

  // Charge les genres et plateformes à proposer (selon le type et la langue)
  useEffect(() => {
    async function chargerOptions() {
      try {
        const reponse = await fetch(`/api/filtres?type=${filtres.type}&langue=${langue}`);
        setOptions(await reponse.json());
      } catch (e) {
        console.error(e);
      }
    }
    chargerOptions();
  }, [filtres.type, langue]);

  // Construit l'adresse /api/explorer?... à partir des filtres
  function construireAdresse(numeroPage) {
    const p = new URLSearchParams({ type: filtres.type, tri: filtres.tri, page: numeroPage, langue });
    if (filtres.q) p.set("q", filtres.q);
    if (filtres.genres.length) p.set("genres", filtres.genres.join(","));
    if (filtres.anneeMin) p.set("anneeMin", filtres.anneeMin);
    if (filtres.anneeMax) p.set("anneeMax", filtres.anneeMax);
    if (filtres.noteMin) p.set("noteMin", filtres.noteMin);
    if (filtres.plateformes.length) p.set("plateformes", filtres.plateformes.join("|"));
    if (filtres.duree) p.set("duree", filtres.duree);
    if (filtres.langueOrigine) p.set("langueOrigine", filtres.langueOrigine);
    return `/api/explorer?${p}`;
  }

  // Dès qu'un filtre change : on recharge la page 1 des résultats
  useEffect(() => {
    // "annule" évite d'afficher une vieille réponse arrivée en retard
    // (si on a changé de filtre entre-temps)
    let annule = false;

    async function charger() {
      setChargement(true);
      setErreur(false);
      try {
        const reponse = await fetch(construireAdresse(1));
        if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`);
        const d = await reponse.json();
        if (!annule) {
          setResultats(d.resultats);
          setPage(1);
          setTotalPages(d.total_pages);
          setTotal(d.total);
        }
      } catch (e) {
        console.error(e);
        if (!annule) {
          setErreur(true);
          setResultats([]);
        }
      }
      if (!annule) setChargement(false);
    }

    charger();
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtres, langue]);

  // Bouton "Charger plus" : on ajoute la page suivante à la suite
  async function chargerPlus() {
    const suivante = page + 1;
    setChargement(true);
    try {
      const reponse = await fetch(construireAdresse(suivante));
      const d = await reponse.json();
      setResultats((avant) => [...avant, ...(d.resultats || [])]);
      setPage(suivante);
    } catch (e) {
      console.error(e);
    }
    setChargement(false);
  }

  // Genres filtrés par le petit champ "Rechercher un genre"
  const genresAffiches = options.genres.filter((g) =>
    g.nom.toLowerCase().includes(rechercheGenre.toLowerCase())
  );

  // Style d'un petit bouton "pilule" (note, tri du type...)
  function stylePilule(actif) {
    return `min-h-10 px-3.5 rounded-full text-sm font-semibold border transition ${
      actif ? "bg-texte text-fond border-texte" : "border-bordure text-texte-2 hover:text-texte"
    }`;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ---------- En-tête de la page ---------- */}
      <div className="flex flex-col gap-2">
        <h1 className="font-titre text-4xl font-bold">{t.explorerTitre}</h1>
        <p className="text-texte-2">{t.explorerSousTitre}</p>
      </div>

      {/* Champ de recherche par titre */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-64 flex items-center gap-3 bg-carte border border-bordure rounded-2xl px-5 focus-within:border-accent/60 transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-texte-2 shrink-0" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20 L16 16" />
          </svg>
          <label htmlFor="titre" className="sr-only">{t.chercherTitre}</label>
          <input
            id="titre"
            type="text"
            value={titreTape}
            onChange={(e) => setTitreTape(e.target.value)}
            placeholder={t.chercherTitre}
            className="flex-1 bg-transparent h-14 text-base focus:outline-none"
          />
        </div>

        {/* Bouton "Filtres" : visible seulement sur petit écran */}
        <button
          onClick={() => setFiltresOuverts(!filtresOuverts)}
          className="lg:hidden h-14 px-5 rounded-2xl border border-bordure bg-carte font-semibold flex items-center gap-2"
          aria-expanded={filtresOuverts}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6 H20 M7 12 H17 M10 18 H14" />
          </svg>
          {t.filtres}
          {nbFiltresActifs > 0 && (
            <span className="min-w-6 h-6 px-1.5 rounded-full bg-accent text-fond text-xs font-bold flex items-center justify-center">
              {nbFiltresActifs}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-8 items-start">
        {/* ==================== Colonne des filtres ==================== */}
        <aside className={`${filtresOuverts ? "flex" : "hidden"} lg:flex flex-col gap-4 w-full lg:w-72 shrink-0`}>
          <div className="flex items-center justify-between">
            <span className="font-titre text-lg font-semibold">{t.filtres}</span>
            <button onClick={reinitialiser} className="min-h-11 text-sm font-semibold text-accent hover:text-accent-hover">
              {t.reinitialiser}
            </button>
          </div>

          {/* Type */}
          <Section titre={t.type}>
            <Option type="radio" name="type" coche={filtres.type === "film"} onChange={() => changerType("film")}>
              {t.films}
            </Option>
            <Option type="radio" name="type" coche={filtres.type === "serie"} onChange={() => changerType("serie")}>
              {t.series}
            </Option>
          </Section>

          {/* Trier par */}
          <Section titre={t.trierPar}>
            <label htmlFor="tri" className="sr-only">{t.trierPar}</label>
            <select id="tri" value={filtres.tri} onChange={(e) => changer("tri", e.target.value)} className={styleChamp}>
              <option value="popularite">{t.triPopularite}</option>
              <option value="note">{t.triNote}</option>
              <option value="date">{t.triDate}</option>
            </select>
          </Section>

          {/* Plateformes */}
          <Section titre={t.plateformesFiltre}>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {options.plateformes.map((pl) => (
                <Option key={pl.id} coche={filtres.plateformes.includes(pl.id)} onChange={() => basculer("plateformes", pl.id)}>
                  {pl.logo && <img src={pl.logo} alt="" className="w-6 h-6 rounded-md shrink-0" />}
                  <span className="truncate">{pl.nom}</span>
                </Option>
              ))}
            </div>
          </Section>

          {/* Genres */}
          <Section titre={t.genres}>
            <label htmlFor="recherche-genre" className="sr-only">{t.chercherGenre}</label>
            <input
              id="recherche-genre"
              type="text"
              value={rechercheGenre}
              onChange={(e) => setRechercheGenre(e.target.value)}
              placeholder={t.chercherGenre}
              className={styleChamp}
            />
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {genresAffiches.map((g) => (
                <Option key={g.id} coche={filtres.genres.includes(g.id)} onChange={() => basculer("genres", g.id)}>
                  {g.nom}
                </Option>
              ))}
            </div>
          </Section>

          {/* Année */}
          <Section titre={t.annee}>
            <div className="flex items-center gap-2">
              <label htmlFor="annee-min" className="sr-only">{t.anneeDe}</label>
              <input
                id="annee-min"
                type="number"
                inputMode="numeric"
                min="1900"
                max="2100"
                value={filtres.anneeMin}
                onChange={(e) => changer("anneeMin", e.target.value)}
                placeholder={t.anneeDe}
                className={styleChamp}
              />
              <span className="text-texte-3" aria-hidden="true">–</span>
              <label htmlFor="annee-max" className="sr-only">{t.anneeA}</label>
              <input
                id="annee-max"
                type="number"
                inputMode="numeric"
                min="1900"
                max="2100"
                value={filtres.anneeMax}
                onChange={(e) => changer("anneeMax", e.target.value)}
                placeholder={t.anneeA}
                className={styleChamp}
              />
            </div>
          </Section>

          {/* Note minimale */}
          <Section titre={t.noteMin}>
            <div className="flex flex-wrap gap-2">
              {["", "6", "7", "8"].map((note) => (
                <button key={note || "toutes"} onClick={() => changer("noteMin", note)} className={stylePilule(filtres.noteMin === note)}>
                  {note ? `★ ${note}+` : t.toutes}
                </button>
              ))}
            </div>
          </Section>

          {/* Durée : films seulement */}
          {filtres.type === "film" && (
            <Section titre={t.duree}>
              {[
                ["", t.toutes],
                ["court", t.dureeCourt],
                ["moyen", t.dureeMoyen],
                ["long", t.dureeLong],
              ].map(([valeur, nom]) => (
                <Option key={valeur || "toutes"} type="radio" name="duree" coche={filtres.duree === valeur} onChange={() => changer("duree", valeur)}>
                  {nom}
                </Option>
              ))}
            </Section>
          )}

          {/* Langue d'origine */}
          <Section titre={t.langueOrigine}>
            <label htmlFor="langue-origine" className="sr-only">{t.langueOrigine}</label>
            <select
              id="langue-origine"
              value={filtres.langueOrigine}
              onChange={(e) => changer("langueOrigine", e.target.value)}
              className={styleChamp}
            >
              <option value="">{t.toutes}</option>
              {LANGUES_ORIGINE.map((code) => (
                <option key={code} value={code}>{t.langues[code]}</option>
              ))}
            </select>
          </Section>

          {/* Sur téléphone : bouton pour refermer les filtres et voir la grille */}
          <button
            onClick={() => setFiltresOuverts(false)}
            className="lg:hidden h-12 rounded-xl bg-accent hover:bg-accent-hover text-fond font-bold"
          >
            {t.voirResultats}
          </button>
        </aside>

        {/* ==================== Grille des résultats ==================== */}
        <div className="flex-[999_1_560px] min-w-0 flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline gap-3 min-h-6">
            {!chargement && !erreur && total > 0 && (
              <span className="text-texte-2">{t.titresTrouves(total)}</span>
            )}
            {filtres.q && <span className="text-sm text-texte-3">{t.filtresIgnores}</span>}
          </div>

          {erreur && <p className="text-coeur">{t.erreur}</p>}
          {!chargement && !erreur && resultats.length === 0 && (
            <p className="text-texte-2">{t.aucunTitre}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-7">
            {resultats.map((element, i) => (
              <CartePoster
                key={`${element.tmdb_id}-${i}`}
                element={element}
                aime={titresAimes.includes(element.titre)}
                onBasculer={basculerFavori}
              />
            ))}
          </div>

          {chargement && <p className="text-texte-2">{t.chargement}</p>}

          {/* "Charger plus" tant qu'il reste des pages */}
          {!chargement && page < totalPages && resultats.length > 0 && (
            <button
              onClick={chargerPlus}
              className="self-center h-12 px-6 rounded-xl border border-bordure bg-carte hover:bg-carte-2 font-semibold transition"
            >
              {t.chargerPlus}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
