import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmación bloqueante que requiere una acción explícita del usuario.
 * Renderizado en un portal fijo sobre toda la interfaz con fondo semi-opaco.
 * @param props - Control de visibilidad, textos y callbacks de confirmación y cancelación.
 * @returns Modal animado o fragmento vacío si no está abierto.
 */
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel
}: ConfirmModalProps): ReactElement {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onCancel}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon-wrap">
              <AlertTriangle size={20} strokeWidth={2} />
            </div>
            <div className="modal-body">
              <h2 className="modal-title">{title}</h2>
              <p className="modal-message">{message}</p>
            </div>
            <footer className="modal-footer">
              <button className="button" data-variant="ghost" type="button" onClick={onCancel}>
                {t("actions.cancel")}
              </button>
              <button className="button" data-variant="danger-solid" type="button" onClick={onConfirm}>
                {confirmLabel ?? t("instances.remove")}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
