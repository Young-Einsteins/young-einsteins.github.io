import { translations } from "./translations.js";

export function translate(lang, key) {
  const entry = translations[key];
  if (!entry) return null;
  return entry[lang] ?? entry.en ?? null;
}

function applyLanguage(lang) {
  const activeLang = lang === "vi" ? "vi" : "en";
  document.documentElement.lang = activeLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const text = translate(activeLang, el.getAttribute("data-i18n"));
    if (text !== null) el.textContent = text;
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const text = translate(activeLang, el.getAttribute("data-i18n-html"));
    if (text !== null) el.innerHTML = text;
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.getAttribute("data-i18n-attr")
      .split(";")
      .forEach((pair) => {
        const [attr, key] = pair.split(":").map((part) => part.trim());
        if (!attr || !key) return;
        const text = translate(activeLang, key);
        if (text !== null) el.setAttribute(attr, text);
      });
  });

  document.querySelectorAll(".lang-option").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.lang === activeLang);
  });

  localStorage.setItem("ye-lang", activeLang);

  document.dispatchEvent(new CustomEvent("languagechange"));
}

export function initLanguageToggle() {
  applyLanguage(localStorage.getItem("ye-lang") || "en");

  document.querySelectorAll(".lang-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      const option = event.target.closest(".lang-option");
      if (option) applyLanguage(option.dataset.lang);
    });
  });
}
