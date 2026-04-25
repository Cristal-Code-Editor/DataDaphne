import { MX, US } from "country-flag-icons/react/3x2";
import { Languages } from "lucide-react";
import { motion } from "motion/react";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import type { LanguageCode } from "../i18n";
import { changeLanguage, SUPPORTED_LANGUAGES } from "../i18n";
import { TooltipIconButton } from "./TooltipIconButton";

const FLAG_BY_LANGUAGE: Record<LanguageCode, typeof MX> = {
  es: MX,
  en: US
};

/**
 * Muestra idiomas disponibles con banderas SVG y cambia la traducción activa.
 * @returns Selector compacto de idioma con píldora animada.
 */
export function LanguageSwitcher(): ReactElement {
  const { i18n, t } = useTranslation();

  return (
    <div className="segment-group" role="group" aria-label={t("language.label")}>
      <span className="segment-leading" aria-hidden="true">
        <Languages size={15} strokeWidth={2.1} />
      </span>
      {SUPPORTED_LANGUAGES.map((language) => {
        const Flag = FLAG_BY_LANGUAGE[language.code];
        const label = t(language.labelKey);
        const isActive = i18n.language === language.code;

        return (
          <TooltipIconButton
            key={language.code}
            active={isActive}
            className="segment-button flag-button"
            label={label}
            onClick={() => void changeLanguage(language.code)}
          >
            {isActive ? (
              <motion.span
                className="segment-active-pill"
                layoutId="language-active-pill"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            ) : null}
            <Flag title={label} />
          </TooltipIconButton>
        );
      })}
    </div>
  );
}
