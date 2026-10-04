(() => {
  const saved = localStorage.getItem("vaultx.appearance") || "system";
  const dark = saved === "dark" || saved === "system" && matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
})();
