import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";

interface PreferencesState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

const THEME_STORAGE_KEY = "datadaphne.theme";

/**
 * Lee la preferencia visual persistida y descarta valores no soportados.
 * @returns Tema elegido por el usuario o modo sistema como valor inicial.
 */
function getInitialTheme(): ThemePreference {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
    return storedTheme;
  }

  return "system";
}

/**
 * Resuelve el tema efectivo cuando la preferencia depende del sistema operativo.
 * @param theme - Preferencia guardada por el usuario.
 * @returns Tema concreto que debe aplicarse al documento.
 */
export function resolveTheme(theme: ThemePreference): Exclude<ThemePreference, "system"> {
  if (theme !== "system") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Muta el atributo data-theme sin animación. Usada dentro de transiciones de vista.
 * @param theme - Preferencia visual seleccionada.
 * @returns No retorna valor; modifica el atributo data-theme del documento.
 */
export function applyTheme(theme: ThemePreference): void {
  document.documentElement.dataset.theme = resolveTheme(theme);
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  }
}));
