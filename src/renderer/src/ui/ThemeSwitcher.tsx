import { MonitorCog, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import type { MouseEvent, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import type { ThemePreference } from "../stores/preferences-store";
import { usePreferencesStore } from "../stores/preferences-store";
import { TooltipIconButton } from "./TooltipIconButton";

const THEME_OPTIONS: Array<{ value: ThemePreference; labelKey: string; icon: typeof Sun }> = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
  { value: "system", labelKey: "theme.system", icon: MonitorCog }
];

/**
 * Registra el centro del botón pulsado como origen de la View Transition.
 * @param event - Evento del clic sobre el botón de segmento.
 * @returns No retorna valor; escribe las variables CSS en el elemento raíz.
 */
function setTransitionOrigin(event: MouseEvent<HTMLButtonElement>): void {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.round(rect.left + rect.width / 2);
  const y = Math.round(rect.top + rect.height / 2);
  document.documentElement.style.setProperty("--vt-x", `${x}px`);
  document.documentElement.style.setProperty("--vt-y", `${y}px`);
}

/**
 * Permite alternar entre tema claro, oscuro y sistema con píldora animada.
 * @returns Control segmentado de preferencias visuales.
 */
export function ThemeSwitcher(): ReactElement {
  const { t } = useTranslation();
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);

  return (
    <div className="segment-group" role="group" aria-label={t("theme.system")}>
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const label = t(option.labelKey);
        const isActive = theme === option.value;

        return (
          <TooltipIconButton
            key={option.value}
            active={isActive}
            className="segment-button"
            label={label}
            onClick={(event) => {
              setTransitionOrigin(event);
              setTheme(option.value);
            }}
          >
            {isActive ? (
              <motion.span
                className="segment-active-pill"
                layoutId="theme-active-pill"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            ) : null}
            <Icon size={15} strokeWidth={2.1} />
          </TooltipIconButton>
        );
      })}
    </div>
  );
}
