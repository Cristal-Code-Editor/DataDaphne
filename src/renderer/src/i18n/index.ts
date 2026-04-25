import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";

export type LanguageCode = "es" | "en";

export const SUPPORTED_LANGUAGES: Array<{ code: LanguageCode; labelKey: string }> = [
  { code: "es", labelKey: "language.spanish" },
  { code: "en", labelKey: "language.english" }
];

const LANGUAGE_STORAGE_KEY = "datadaphne.language";

/**
 * Obtiene el idioma inicial desde el almacenamiento local o conserva español como base.
 * @returns Código de idioma soportado por DataDaphne.
 */
function getInitialLanguage(): LanguageCode {
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (storedLanguage === "en" || storedLanguage === "es") {
    return storedLanguage;
  }

  return "es";
}

/**
 * Cambia el idioma activo con transición de vista suave y persiste la preferencia.
 * @param language - Código de idioma que debe activarse.
 * @returns Promesa resuelta cuando i18next y la transición terminan.
 */
export async function changeLanguage(language: LanguageCode): Promise<void> {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

  if (typeof document.startViewTransition === "function") {
    const transition = document.startViewTransition(() => i18n.changeLanguage(language));
    await transition.finished;
  } else {
    await i18n.changeLanguage(language);
  }
}

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en }
  },
  lng: getInitialLanguage(),
  fallbackLng: "es",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
