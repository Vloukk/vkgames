import { supabase } from "../../../src/utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { host_id } = req.body; // Récupère l'ID de l'hôte

  if (!host_id) {
    return res.status(400).json({ error: "host_id est requis" });
  }

  // 🏆 Création de la partie avec l'ID de l'hôte
  const { data, error } = await supabase
    .from("games")
    .insert([{ host_id, status: "waiting" }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
}
