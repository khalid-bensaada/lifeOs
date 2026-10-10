try {
  var prefs = JSON.parse(localStorage.getItem("lifeos-prefs") || "{}");
  var root = document.documentElement;
  if (prefs.language) {
    root.lang = prefs.language;
    root.dir = prefs.language === "ar" ? "rtl" : "ltr";
  }
  var dark =
    prefs.theme === "dark" ||
    (prefs.theme !== "light" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) root.classList.add("dark");
} catch (e) {}
