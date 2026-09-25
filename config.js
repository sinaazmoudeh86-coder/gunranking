/* ============================================================
   LAUNCH CONFIG
   Paste your Supabase project values here to turn on the GLOBAL
   leaderboard. Leave both blank and the game still works — scores
   just stay on each player's device.

   Where to find these: supabase.com → your project →
   Settings → API → "Project URL" and "anon public" key.
   The anon key is safe to publish in client code.
   ============================================================ */
window.APP_CONFIG = {
  SUPABASE_URL: "https://dmgjswhpkavmytlykdwv.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_OlMf9JR0-6pMW8dhWDLARA_ZOJ6VqYG",

  /* Admin portal (footer → "Admin"): PIN to view & download the player
     email/name database as CSV. CHANGE THIS before launch. */
  ADMIN_PIN: "20042004",
  /* Optional: address the "Email list to us" button composes to. Leave
     blank to hide that button (the CSV download always works). */
  ADMIN_EMAIL: "marketing@grabagun.com"
};
