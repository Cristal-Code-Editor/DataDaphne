import { MonitorCog, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import type { ThemePreference } from "../stores/preferences-store";
import { usePreferencesStore } from "../stores/preferences-store";
import { TooltipIconButton } from "./TooltipIconButton";
import { triggerWipe } from "./WipeTransition";

const THEME_OPTIONS: Array<{ value: ThemePreference; labelKey: string; icon: typeof Sun }> = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
  { value: "system", labelKey: "theme.system", icon: MonitorCog }
];

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
            onClick={() => void triggerWipe(() => setTheme(option.value))}
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
