// ============================================================
// Connexion à Supabase (la base de données)
// ------------------------------------------------------------
// Ce fichier crée UN SEUL "client" Supabase. Les autres fichiers
// l'importent avec :  import { supabase } from "../lib/supabase";
// ============================================================

import { createClient } from "@supabase/supabase-js";

// Ces deux valeurs viennent du fichier .env.local (à la racine du projet)
const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cleSupabase = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Le client qu'on utilise partout pour lire / écrire dans la table "likes"
export const supabase = createClient(urlSupabase, cleSupabase);
