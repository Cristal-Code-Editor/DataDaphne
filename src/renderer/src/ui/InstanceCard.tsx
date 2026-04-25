import { CircleDot, CircleOff, Copy, Link2, Play, TerminalSquare, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type { CSSProperties, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import type { InstanceRecord } from "../../../shared/instance";
import { EngineGlyph } from "./EngineGlyph";

const ACCENT_BY_ENGINE: Record<string, string> = {
  postgresql: "#336791",
  redis: "#D82C20",
  mariadb: "#003545",
  mysql: "#00758F"
};

interface InstanceCardProps {
  instance: InstanceRecord;
  index: number;
  onStart: (containerId: string) => void;
  onStop: (containerId: string) => void;
  onRemove: (containerId: string) => void;
  onCopyConnection: (connectionString: string) => void;
  onLogs: (containerId: string) => void;
}

/**
 * Copia texto al portapapeles del sistema.
 * @param text - Texto a copiar.
 * @returns No retorna valor.
 */
function copyToClipboard(text: string): void {
  void navigator.clipboard.writeText(text);
}

/**
 * Formatea una fecha ISO en una cadena legible relativa al momento actual.
 * @param isoDate - Fecha de creación en formato ISO 8601.
 * @returns Cadena de tiempo transcurrido como "hace 2 horas".
 */
function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days}d`;
  if (hours > 0) return `hace ${hours}h`;
  if (minutes > 0) return `hace ${minutes}m`;
  return "justo ahora";
}

/**
 * Tarjeta que muestra el estado de un contenedor DataDaphne y permite operar sobre él.
 * @param props - Instancia a representar, índice para la animación y callbacks de acción.
 * @returns Tarjeta de instancia lista para el grid de la vista de instancias.
 */
export function InstanceCard({ instance, index, onStart, onStop, onRemove, onCopyConnection, onLogs }: InstanceCardProps): ReactElement {
  const { t } = useTranslation();
  const accent = ACCENT_BY_ENGINE[instance.engineId] ?? "#6b7480";
  const isRunning = instance.status === "running";

  return (
    <motion.article
      className="instance-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: 0.04 * index, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ "--engine-accent": accent } as CSSProperties}
    >
      <div className="instance-header">
        <div className="instance-identity">
          <div className="engine-mark instance-mark">
            <EngineGlyph engineId={instance.engineId} />
          </div>
          <div className="instance-info">
            <span className="instance-engine">{instance.engineLabel}</span>
            <h3 className="instance-name">{instance.name}</h3>
            <span className="instance-image">{instance.image}</span>
          </div>
        </div>

        <span className="instance-status-pill" data-status={instance.status}>
          {isRunning ? (
            <>
              <span className="pulse-dot" />
              {t("instances.running")}
            </>
          ) : (
            <>
              <CircleOff size={10} />
              {t("instances.stopped")}
            </>
          )}
        </span>
      </div>

      <div className="instance-meta">
        <div className="instance-meta-item">
          <span className="instance-meta-label">{t("engineConfig.port")}</span>
          <button
            className="instance-copy-tag"
            type="button"
            onClick={() => copyToClipboard(String(instance.port))}
            title={t("instances.copyPort")}
          >
            <strong>:{instance.port}</strong>
            <Copy size={11} strokeWidth={2.2} />
          </button>
        </div>
        <div className="instance-meta-item">
          <span className="instance-meta-label">ID</span>
          <button
            className="instance-copy-tag"
            type="button"
            onClick={() => copyToClipboard(instance.containerId)}
            title={t("instances.copyId")}
          >
            <strong>{instance.id}</strong>
            <Copy size={11} strokeWidth={2.2} />
          </button>
        </div>
        <div className="instance-meta-item">
          <span className="instance-meta-label">{t("instances.created")}</span>
          <span className="instance-meta-value">{formatRelativeTime(instance.createdAt)}</span>
        </div>
      </div>

      <footer className="instance-actions">
        <button
          className="button"
          data-variant="ghost"
          type="button"
          onClick={() => onCopyConnection(instance.connectionString)}
          title={t("instances.copyConnection")}
        >
          <Link2 size={13} strokeWidth={2.1} />
          {t("instances.copyConnection")}
        </button>
        {isRunning ? (
          <button
            className="button"
            data-variant="ghost"
            type="button"
            onClick={() => onStop(instance.containerId)}
          >
            <CircleDot size={13} strokeWidth={2.1} />
            {t("instances.stop")}
          </button>
        ) : (
          <button
            className="button"
            data-variant="ghost"
            type="button"
            onClick={() => onStart(instance.containerId)}
          >
            <Play size={13} strokeWidth={2.1} />
            {t("instances.start")}
          </button>
        )}
        <button
          className="button"
          data-variant="ghost"
          type="button"
          onClick={() => onLogs(instance.containerId)}
          title={t("logs.open")}
        >
          <TerminalSquare size={13} strokeWidth={2.1} />
          {t("logs.open")}
        </button>
        <button
          className="button"
          data-variant="danger"
          type="button"
          onClick={() => onRemove(instance.containerId)}
        >
          <Trash2 size={13} strokeWidth={2.1} />
          {t("instances.remove")}
        </button>
      </footer>
    </motion.article>
  );
}
