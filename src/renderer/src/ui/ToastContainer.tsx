import { CheckCircle, Info, X, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactElement } from "react";

import type { Toast } from "../stores/toast-store";
import { useToastStore } from "../stores/toast-store";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info
} as const;

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

/**
 * Elemento individual de notificación con icono, mensaje y botón de cierre.
 * @param props - Toast a renderizar y callback para descartarlo manualmente.
 * @returns Ítem de notificación animado con Motion.
 */
function ToastItem({ toast, onDismiss }: ToastItemProps): ReactElement {
  const Icon = ICONS[toast.type];

  return (
    <motion.div
      className="toast"
      data-type={toast.type}
      layout
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.95 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <Icon className="toast-icon" size={14} strokeWidth={2.2} />
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
      >
        <X size={12} strokeWidth={2.4} />
      </button>
    </motion.div>
  );
}

/**
 * Contenedor global de notificaciones, posicionado en la esquina inferior derecha.
 * Escucha el store de toasts y renderiza cada uno con animaciones de entrada y salida.
 * @returns Overlay fijo que no interfiere con la navegación de la aplicación.
 */
export function ToastContainer(): ReactElement {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
