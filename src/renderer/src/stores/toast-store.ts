import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

/**
 * Genera un ID único suficientemente aleatorio para las notificaciones.
 * @returns Cadena hexadecimal de 8 caracteres.
 */
function generateId(): string {
  return Math.random().toString(16).slice(2, 10);
}

/**
 * Store global de notificaciones transitorias (toasts).
 * Cada toast se elimina automáticamente pasado el tiempo de duración indicado.
 */
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (message, type, duration = 4000) => {
    const id = generateId();

    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));
