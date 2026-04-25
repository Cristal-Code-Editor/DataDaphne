import { Activity, Archive, Boxes, Database, Plus, RefreshCcw, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { DatabaseEngineDefinition } from "../../../shared/database-engines";
import { DATABASE_ENGINES } from "../../../shared/database-engines";
import type { DockerStatus } from "../../../shared/docker-status";
import { applyTheme, usePreferencesStore } from "../stores/preferences-store";
import { EngineCard } from "./EngineCard";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { WipeTransition } from "./WipeTransition";

const INITIAL_DOCKER_STATUS: DockerStatus = {
  available: false,
  version: null,
  message: "Docker Desktop no está disponible o no se encuentra en ejecución."
};

const NAVIGATION = [
  { id: "instances", labelKey: "nav.instances", icon: Boxes },
  { id: "engines", labelKey: "nav.engines", icon: Database },
  { id: "backups", labelKey: "nav.backups", icon: Archive },
  { id: "settings", labelKey: "nav.settings", icon: Settings }
] as const;

type NavigationId = (typeof NAVIGATION)[number]["id"];

/**
 * Marca de DataDaphne dibujada como par de ondas entrelazadas para la barra lateral.
 * @returns Elemento SVG con identidad visual personalizada de la marca.
 */
function BrandGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4.5 14c1.6-3.6 4-5.4 6.5-5.4 2.6 0 4 1.6 4 3.6s-1.4 3.4-3.4 3.4c-2.4 0-3.6-2.2-3.6-4.6 0-3.4 2-6 5-6"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17.6" cy="6.6" r="1.4" fill="white" />
    </svg>
  );
}

/**
 * Renderiza la aplicación principal con dashboard premium, motores y controles de UI.
 * @returns Interfaz principal de DataDaphne.
 */
export function App(): ReactElement {
  const { t } = useTranslation();
  const theme = usePreferencesStore((state) => state.theme);
  const [dockerStatus, setDockerStatus] = useState<DockerStatus>(INITIAL_DOCKER_STATUS);
  const [engines, setEngines] = useState<DatabaseEngineDefinition[]>(DATABASE_ENGINES);
  const [activeNav, setActiveNav] = useState<NavigationId>("instances");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    void refreshDockerStatus();
    void loadDatabaseEngines();
  }, []);

  /**
   * Solicita el estado actual de Docker al proceso principal.
   * @returns Promesa resuelta cuando se sincroniza el estado visual.
   */
  async function refreshDockerStatus(): Promise<void> {
    const status = await window.datadaphne.getDockerStatus();
    setDockerStatus(status);
  }

  /**
   * Carga el catálogo de motores soportados desde la capa preload.
   * @returns Promesa resuelta cuando la lista de motores se actualiza.
   */
  async function loadDatabaseEngines(): Promise<void> {
    const availableEngines = await window.datadaphne.getDatabaseEngines();
    setEngines(availableEngines);
  }

  const totalPorts = engines.reduce((sum, engine) => sum + (engine.defaultPort > 0 ? 1 : 0), 0);

  return (
    <>
      <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="brand-symbol" aria-hidden="true">
            <BrandGlyph />
          </div>
          <div className="brand-copy">
            <h1 className="brand-title">{t("app.name")}</h1>
            <p className="brand-subtitle">cristalce.com</p>
          </div>
        </div>

        <nav>
          <p className="nav-section-label">{t("app.section")}</p>
          <div className="nav-list">
            {NAVIGATION.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              const label = t(item.labelKey);

              return (
                <button
                  className="nav-item"
                  data-active={isActive}
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  type="button"
                >
                  {isActive ? (
                    <motion.span
                      className="nav-active-pill"
                      layoutId="nav-active-pill"
                      transition={{ type: "spring", stiffness: 480, damping: 38 }}
                    />
                  ) : null}
                  <span className="nav-icon">
                    <Icon size={16} strokeWidth={2.1} />
                  </span>
                  <span className="nav-label">{label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">v0.1.0-alpha · MIT</div>
      </aside>

      <section className="workspace">
        <header className="workspace-topbar">
          <div className="workspace-title-block">
            <span className="workspace-eyebrow">{t("nav.instances")}</span>
            <h2 className="workspace-title">{t("app.section")}</h2>
          </div>
          <div className="workspace-actions">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <button className="button" data-variant="primary" type="button">
              <Plus size={14} strokeWidth={2.4} />
              {t("actions.newInstance")}
            </button>
          </div>
        </header>

        <main className="content-scroll">
          <section className="hero-grid">
            <motion.article
              className="status-hero"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="status-copy">
                <span className="status-eyebrow">
                  <Activity size={12} strokeWidth={2.4} /> Docker Desktop
                </span>
                <h1 className="status-headline">
                  {dockerStatus.available
                    ? "Docker está disponible y listo para crear instancias."
                    : "Docker no está disponible. Inicia Docker Desktop para continuar."}
                </h1>
                <p className="status-message">
                  {dockerStatus.version
                    ? t("status.version", { version: dockerStatus.version })
                    : dockerStatus.message}
                </p>
                <span className="status-pill" data-offline={!dockerStatus.available}>
                  <span className="pulse-dot" />
                  {dockerStatus.available ? t("status.dockerReady") : t("status.dockerOffline")}
                </span>
              </div>
              <div className="status-actions">
                <AnimatePresence mode="wait">
                  <motion.button
                    key={dockerStatus.available ? "ready" : "offline"}
                    className="icon-button"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 45 }}
                    onClick={() => void refreshDockerStatus()}
                    aria-label={t("actions.refresh")}
                  >
                    <RefreshCcw size={15} strokeWidth={2.1} />
                  </motion.button>
                </AnimatePresence>
              </div>
            </motion.article>

            <div className="metric-strip">
              <div className="metric-row">
                <MetricCard label={t("stats.engines")} value={engines.length} hint="MVP soportado" />
                <MetricCard label={t("stats.instances")} value={0} hint="Listo para crear" />
              </div>
              <div className="metric-row">
                <MetricCard label={t("stats.ports")} value={totalPorts} hint="Configurables" />
                <MetricCard label={t("stats.profiles")} value={0} hint="Próximamente" />
              </div>
            </div>
          </section>

          <header className="section-heading">
            <h3 className="section-title">{t("nav.engines")}</h3>
            <span className="section-meta">{engines.length} motores · puerto editable</span>
          </header>

          <section className="engine-grid" aria-label={t("nav.engines")}>
            {engines.map((engine, index) => (
              <EngineCard disabled={!dockerStatus.available} engine={engine} index={index} key={engine.id} />
            ))}
          </section>
        </main>
      </section>
      </div>
      <WipeTransition />
    </>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  hint: string;
}

/**
 * Tarjeta compacta para mostrar una métrica numérica del dashboard.
 * @param props - Etiqueta, valor numérico y pista contextual del indicador.
 * @returns Tarjeta visual con la métrica enmarcada.
 */
function MetricCard({ label, value, hint }: MetricCardProps): ReactElement {
  return (
    <motion.article
      className="metric-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-foot">{hint}</span>
    </motion.article>
  );
}
