import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface LogsDrawerProps {
  open: boolean;
  containerId: string;
  instanceName: string;
  onClose: () => void;
}

/**
 * Panel lateral de logs en tiempo real para un contenedor Docker.
 * Se abre como un drawer desde la parte inferior de la pantalla.
 * Inicia el stream de logs al montarse y lo cancela al cerrarse.
 * @param props - Estado de apertura, ID del contenedor, nombre y callback de cierre.
 * @returns Drawer animado con los logs del contenedor.
 */
export function LogsDrawer({ open, containerId, instanceName, onClose }: LogsDrawerProps): ReactElement {
  const { t } = useTranslation();
  const [lines, setLines] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Cierre con Escape
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Iniciar / detener stream de logs
  useEffect(() => {
    if (!open || !containerId) return;

    setLines([]);

    void window.datadaphne.startLogs(containerId);

    const unsubscribe = window.datadaphne.onLogsChunk((data) => {
      if (data.containerId !== containerId) return;
      const newLines = data.line.split(/\r?\n/).filter((l) => l.length > 0);
      setLines((prev) => [...prev, ...newLines]);
    });

    return () => {
      unsubscribe();
      void window.datadaphne.stopLogs(containerId);
    };
  }, [open, containerId]);

  // Auto-scroll al fondo cuando llegan nuevas líneas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay semi-transparente */}
          <motion.div
            className="logs-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer deslizante desde abajo */}
          <motion.aside
            className="logs-drawer"
            role="complementary"
            aria-label={t("logs.title", { name: instanceName })}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="logs-header">
              <span className="logs-title">
                {t("logs.title", { name: instanceName })}
              </span>
              <button
                className="button logs-close"
                data-variant="ghost"
                type="button"
                onClick={onClose}
                aria-label={t("actions.cancel")}
              >
                <X size={15} strokeWidth={2} />
              </button>
            </header>

            <div className="logs-body">
              {lines.length === 0 ? (
                <p className="logs-empty">{t("logs.empty")}</p>
              ) : (
                <pre className="logs-pre">
                  {lines.map((line, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <span key={i} className="logs-line">
                      {line}
                      {"\n"}
                    </span>
                  ))}
                  <div ref={bottomRef} />
                </pre>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
