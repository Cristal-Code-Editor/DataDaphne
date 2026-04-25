import { Activity, Archive, Boxes, Database, Plus, RefreshCcw, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { DatabaseEngineDefinition } from "../../../shared/database-engines";
import { DATABASE_ENGINES } from "../../../shared/database-engines";
import type { DockerStatus } from "../../../shared/docker-status";
import type { CreateInstancePayload, InstanceRecord } from "../../../shared/instance";
import { applyTheme, usePreferencesStore } from "../stores/preferences-store";
import { useToastStore } from "../stores/toast-store";
import { ConfirmModal } from "./ConfirmModal";
import { EngineCard } from "./EngineCard";
import { InstanceCard } from "./InstanceCard";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ToastContainer } from "./ToastContainer";
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
  const addToast = useToastStore((state) => state.addToast);
  const [dockerStatus, setDockerStatus] = useState<DockerStatus>(INITIAL_DOCKER_STATUS);
  const [engines, setEngines] = useState<DatabaseEngineDefinition[]>(DATABASE_ENGINES);
  const [instances, setInstances] = useState<InstanceRecord[]>([]);
  const [activeNav, setActiveNav] = useState<NavigationId>("instances");
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    void refreshDockerStatus();
    void loadDatabaseEngines();
    void loadInstances();
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

  /**
   * Recupera todas las instancias gestionadas por DataDaphne desde Docker.
   * @returns Promesa resuelta cuando el estado de instancias se sincroniza.
   */
  async function loadInstances(): Promise<void> {
    const list = await window.datadaphne.listInstances();
    setInstances(list);
  }

  /**
   * Crea un contenedor para el motor y configuración indicados.
   * Al finalizar con éxito, refresca la lista y navega a la vista de instancias.
   * @param payload - Motor elegido, nombre y valores del formulario.
   * @returns Promesa resuelta o rechazada con el mensaje de error del daemon.
   */
  async function handleCreateInstance(payload: CreateInstancePayload): Promise<void> {
    const result = await window.datadaphne.createInstance(payload);
    if (!result.success) {
      throw new Error(result.error ?? t("instances.createError"));
    }
    await loadInstances();
    setActiveNav("instances");
    addToast(t("toast.instanceCreated", { name: payload.instanceName }), "success");
  }

  /**
   * Arranca un contenedor detenido y recarga la lista de instancias.
   * @param containerId - ID completo del contenedor a iniciar.
   * @returns Promesa resuelta cuando Docker confirma la operación.
   */
  async function handleStartInstance(containerId: string): Promise<void> {
    const result = await window.datadaphne.startInstance(containerId);
    if (result.success) {
      await loadInstances();
      addToast(t("toast.instanceStarted"), "success");
    } else {
      addToast(result.error ?? t("toast.operationFailed"), "error");
    }
  }

  /**
   * Detiene el contenedor indicado y recarga la lista de instancias.
   * @param containerId - ID completo del contenedor a detener.
   * @returns Promesa resuelta cuando Docker confirma la operación.
   */
  async function handleStopInstance(containerId: string): Promise<void> {
    const result = await window.datadaphne.stopInstance(containerId);
    if (result.success) {
      await loadInstances();
      addToast(t("toast.instanceStopped"), "info");
    } else {
      addToast(result.error ?? t("toast.operationFailed"), "error");
    }
  }

  /**
   * Solicita confirmación al usuario y, si la da, elimina el contenedor.
   * @param containerId - ID completo del contenedor a eliminar.
   * @returns No retorna valor; la confirmación es asíncrona por el modal.
   */
  function handleRequestRemove(containerId: string): void {
    setPendingRemoveId(containerId);
  }

  /**
   * Elimina permanentemente el contenedor pendiente tras la confirmación del usuario.
   * @returns Promesa resuelta cuando Docker confirma la operación.
   */
  async function handleConfirmRemove(): Promise<void> {
    if (!pendingRemoveId) return;
    const id = pendingRemoveId;
    setPendingRemoveId(null);
    const result = await window.datadaphne.removeInstance(id);
    if (result.success) {
      await loadInstances();
      addToast(t("toast.instanceRemoved"), "success");
    } else {
      addToast(result.error ?? t("toast.operationFailed"), "error");
    }
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
            <span className="workspace-eyebrow">{t("app.name")}</span>
            <h2 className="workspace-title">{t(`nav.${activeNav}`)}</h2>
          </div>
          <div className="workspace-actions">
            <ThemeSwitcher />
            <LanguageSwitcher />
            {activeNav === "instances" && (
              <button
                className="button"
                data-variant="primary"
                type="button"
                onClick={() => setActiveNav("engines")}
              >
                <Plus size={14} strokeWidth={2.4} />
                {t("actions.newInstance")}
              </button>
            )}
          </div>
        </header>

        <main className="content-scroll">
          <AnimatePresence mode="wait">
            {activeNav === "instances" && (
              <motion.div
                key="instances-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
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
                          ? t("status.dockerAvailable")
                          : t("status.dockerUnavailable")}
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
                      <MetricCard label={t("stats.engines")} value={engines.length} hint={t("stats.enginesHint")} />
                      <MetricCard label={t("stats.instances")} value={instances.length} hint={t("stats.instancesHint")} />
                    </div>
                    <div className="metric-row">
                      <MetricCard label={t("stats.ports")} value={totalPorts} hint={t("stats.portsHint")} />
                      <MetricCard
                        label={t("stats.running")}
                        value={instances.filter((i) => i.status === "running").length}
                        hint={t("stats.runningHint")}
                      />
                    </div>
                  </div>
                </section>

                <header className="section-heading">
                  <h3 className="section-title">{t("nav.instances")}</h3>
                  <span className="section-meta">
                    {instances.length === 0
                      ? t("instances.empty")
                      : t("instances.count", { count: instances.length })}
                  </span>
                </header>

                {instances.length === 0 ? (
                  <motion.div
                    className="empty-state"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Boxes size={32} strokeWidth={1.4} className="empty-icon" />
                    <p className="empty-message">{t("instances.empty")}</p>
                    <button
                      className="button"
                      data-variant="primary"
                      type="button"
                      onClick={() => setActiveNav("engines")}
                    >
                      <Plus size={14} strokeWidth={2.4} />
                      {t("actions.newInstance")}
                    </button>
                  </motion.div>
                ) : (
                  <section className="instance-grid" aria-label={t("nav.instances")}>
                    <AnimatePresence>
                      {instances.map((instance, index) => (
                        <InstanceCard
                          key={instance.containerId}
                          instance={instance}
                          index={index}
                          onStart={(id) => void handleStartInstance(id)}
                          onStop={(id) => void handleStopInstance(id)}
                          onRemove={(id) => handleRequestRemove(id)}
                          onCopyConnection={(cs) => {
                            void navigator.clipboard.writeText(cs);
                            addToast(t("toast.connectionCopied"), "success");
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </section>
                )}
              </motion.div>
            )}

            {activeNav === "engines" && (
              <motion.div
                key="engines-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <header className="section-heading">
                  <h3 className="section-title">{t("nav.engines")}</h3>
                  <span className="section-meta">{t("section.enginesDescription", { count: engines.length })}</span>
                </header>
                <section className="engine-grid" aria-label={t("nav.engines")}>
                  {engines.map((engine, index) => (
                    <EngineCard
                      disabled={!dockerStatus.available}
                      engine={engine}
                      index={index}
                      key={engine.id}
                      onCreateInstance={handleCreateInstance}
                    />
                  ))}
                </section>
              </motion.div>
            )}

            {(activeNav === "backups" || activeNav === "settings") && (
              <motion.div
                key={`${activeNav}-view`}
                className="placeholder-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <span className="placeholder-message">{t("nav." + activeNav)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </section>
      </div>
      <WipeTransition />
      <ToastContainer />
      <ConfirmModal
        open={pendingRemoveId !== null}
        title={t("confirm.removeTitle")}
        message={t("confirm.removeMessage")}
        onConfirm={() => void handleConfirmRemove()}
        onCancel={() => setPendingRemoveId(null)}
      />
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
