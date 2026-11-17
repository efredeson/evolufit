/* EvoluFit cloud settings. Use ONLY a Supabase publishable key here.
   Never paste a secret or service_role key. Keep values empty until a separate
   EvoluFit project and its private database policies are configured. */
window.EVOLUFIT_SUPABASE = {
  url: "",
  publishableKey: ""
};
if (window.EVOLUFIT_SUPABASE.url && window.EVOLUFIT_SUPABASE.publishableKey) {
  document.documentElement.classList.add("cloud-pending");
}
