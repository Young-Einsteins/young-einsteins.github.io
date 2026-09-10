import { translate } from "./i18n.js";

const CONSENT_KEY = "ye-cookie-consent";

function currentLang() {
  return document.documentElement.lang === "vi" ? "vi" : "en";
}

export function initCookieBanner() {
  if (localStorage.getItem(CONSENT_KEY)) return;

  const lang = currentLang();
  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.className =
    "fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 border-t border-slate-200 bg-white/95 p-4 text-sm text-slate-700 shadow-[0_-8px_24px_rgba(23,42,66,0.1)] backdrop-blur sm:flex-row sm:justify-between sm:px-6";
  banner.innerHTML = `
    <p class="text-center sm:text-left">
      <span data-i18n="cookie.message">${translate(lang, "cookie.message")}</span>
      <a href="privacy.html" class="ml-1 font-bold text-brand-blue underline" data-i18n="cookie.learnmore">${translate(lang, "cookie.learnmore")}</a>
    </p>
    <button type="button" id="cookie-accept" class="btn-primary shrink-0 px-6 py-2.5" data-i18n="cookie.accept">${translate(lang, "cookie.accept")}</button>
  `;

  document.body.appendChild(banner);

  document.getElementById("cookie-accept")?.addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "1");
    banner.remove();
  });
}
