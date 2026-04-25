import { Eye, EyeOff, Sliders, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { CSSProperties, ReactElement } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { DatabaseConfigOption, DatabaseEngineDefinition } from "../../../shared/database-engines";
import { EngineGlyph } from "./EngineGlyph";

type ConfigValue = string | number | boolean;
type ConfigValues = Record<string, ConfigValue>;

interface EngineCardProps {
  engine: DatabaseEngineDefinition;
  disabled: boolean;
  index: number;
}

/**
 * Construye los valores iniciales de configuración para un motor concreto.
 * @param engine - Motor seleccionado desde el catálogo compartido.
 * @returns Mapa con valores editables iniciales del formulario.
 */
function createInitialValues(engine: DatabaseEngineDefinition): ConfigValues {
  return engine.configOptions.reduce<ConfigValues>(
    (values, option) => ({ ...values, [option.key]: option.defaultValue }),
    { instanceName: `${engine.id}-local` }
  );
}

/**
 * Mapea una opción del motor al tipo de input HTML más adecuado.
 * @param option - Definición de la opción de configuración.
 * @param showSecret - Indica si una contraseña debe mostrarse en texto plano.
 * @returns Tipo de input compatible con formularios HTML.
 */
function getInputType(option: DatabaseConfigOption, showSecret: boolean): "text" | "password" | "number" {
  if (option.type === "password") {
    return showSecret ? "text" : "password";
  }

  if (option.type === "number") {
    return "number";
  }

  return "text";
}

/**
 * Resuelve el puerto efectivo del motor priorizando la configuración del usuario.
 * @param values - Valores actuales del formulario.
 * @param engine - Motor para conocer su puerto por defecto.
 * @returns Puerto que se asignará al contenedor.
 */
function resolvePort(values: ConfigValues, engine: DatabaseEngineDefinition): number {
  const portValue = values.port;

  if (typeof portValue === "number" && Number.isFinite(portValue)) {
    return portValue;
  }

  return engine.defaultPort;
}

/**
 * Tarjeta de motor con identidad visual, configuración avanzada y puerto editable.
 * @param props - Motor a representar, índice para animación y disponibilidad de Docker.
 * @returns Tarjeta interactiva lista para integrarse en el grid principal.
 */
export function EngineCard({ engine, disabled, index }: EngineCardProps): ReactElement {
  const { t } = useTranslation();
  const [values, setValues] = useState<ConfigValues>(() => createInitialValues(engine));
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  /**
   * Actualiza un valor del formulario manteniendo el resto intacto.
   * @param key - Clave del valor a modificar.
   * @param value - Nuevo valor introducido por el usuario.
   * @returns No retorna valor; sincroniza el estado visual.
   */
  function updateValue(key: string, value: ConfigValue): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  /**
   * Alterna la visibilidad de un campo de tipo contraseña.
   * @param key - Clave del campo cuyo modo se alterna.
   * @returns No retorna valor; modifica únicamente el estado visual.
   */
  function toggleSecret(key: string): void {
    setRevealedSecrets((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <motion.article
      className="engine-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={{ "--engine-accent": engine.accent } as CSSProperties}
    >
      <header className="engine-header">
        <div className="engine-identity">
          <div className="engine-mark" aria-hidden="true">
            <EngineGlyph engineId={engine.id} />
          </div>
          <div className="engine-title-group">
            <span className="engine-kind">{engine.kind}</span>
            <h3 className="engine-title">{engine.label}</h3>
            <span className="engine-image">{engine.dockerImage}</span>
          </div>
        </div>
      </header>

      <div className="engine-fields">
        <label className="field" style={{ gridColumn: "1 / -1" }}>
          <span className="field-label">{t("engineConfig.instanceName")}</span>
          <input
            className="input"
            value={String(values.instanceName)}
            onChange={(event) => updateValue("instanceName", event.target.value)}
          />
        </label>

        {engine.configOptions.map((option) => {
          const isSecret = option.type === "password";
          const inputType = getInputType(option, Boolean(revealedSecrets[option.key]));

          return (
            <label className="field" key={option.key}>
              <span className="field-label">{t(option.labelKey)}</span>
              {option.type === "boolean" ? (
                <select
                  className="select"
                  value={String(values[option.key])}
                  onChange={(event) => updateValue(option.key, event.target.value === "true")}
                >
                  <option value="true">{t("engineConfig.on")}</option>
                  <option value="false">{t("engineConfig.off")}</option>
                </select>
              ) : (
                <div style={{ position: "relative" }}>
                  <input
                    className="input"
                    type={inputType}
                    value={String(values[option.key])}
                    onChange={(event) => {
                      const nextValue = option.type === "number" ? Number(event.target.value) : event.target.value;
                      updateValue(option.key, nextValue);
                    }}
                  />
                  {isSecret ? (
                    <button
                      type="button"
                      onClick={() => toggleSecret(option.key)}
                      aria-label={t("engineConfig.togglePassword")}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        height: "100%",
                        padding: "0 10px",
                        color: "var(--text-muted)"
                      }}
                    >
                      {revealedSecrets[option.key] ? (
                        <EyeOff size={14} strokeWidth={2.1} />
                      ) : (
                        <Eye size={14} strokeWidth={2.1} />
                      )}
                    </button>
                  ) : null}
                </div>
              )}
            </label>
          );
        })}
      </div>

      <footer className="engine-actions">
        <span className="engine-port-tag">
          {t("engineConfig.port")} <strong>{resolvePort(values, engine)}</strong>
        </span>
        <div className="engine-action-cluster">
          <button className="button" data-variant="ghost" type="button">
            <Sliders size={14} strokeWidth={2.1} />
            {t("actions.configure")}
          </button>
          <button className="button" data-variant="primary" disabled={disabled} type="button">
            <Sparkles size={14} strokeWidth={2.1} />
            {t("actions.create")}
          </button>
        </div>
      </footer>
    </motion.article>
  );
}
