/* EvoluFit: configuração pública. Nunca inclua chaves secretas/service_role. */
window.EVOLUFIT_SUPABASE = {
  url: "https://qovpsvjfeermpjtjwscb.supabase.co",
  publishableKey: "sb_publishable_xjOgwFHjT2C6LnlLMeM98Q_lAq_yrln"
};
if (window.EVOLUFIT_SUPABASE.url && window.EVOLUFIT_SUPABASE.publishableKey) {
  document.documentElement.classList.add("cloud-pending");
}
