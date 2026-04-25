import { useAnimate } from "motion/react";
import type { ReactElement } from "react";
import { useCallback, useEffect } from "react";

type WipeCallback = () => void | Promise<void>;

// Singleton: se registra cuando el componente monta en la raíz de la app
let _trigger: ((cb: WipeCallback) => Promise<void>) | null = null;

/**
 * Lee el color de superficie del tema activo en el momento de la llamada.
 * Se captura antes del cambio para que la cortina coincida con el estado actual.
 * @returns Color hexadecimal de la superficie del tema vigente.
 */
function getPanelColor(): string {
  return document.documentElement.dataset.theme === "dark" ? "#161b22" : "#ffffff";
}

/**
 * Dispara la transición de cortina desde cualquier componente de la app.
 * El callback se ejecuta mientras la cortina cubre toda la pantalla.
 * @param callback - Acción que modifica el estado global (tema, idioma, etc.)
 * @returns Promesa resuelta cuando la animación completa.
 */
export async function triggerWipe(callback: WipeCallback): Promise<void> {
  if (_trigger) {
    await _trigger(callback);
  } else {
    // Fallback sin animación si el panel aún no montó
    await callback();
  }
}

/**
 * Panel de cortina animado que oculta transiciones de estado globales.
 * Debe montarse una sola vez en la raíz de la aplicación.
 * @returns Div fijo que ejecuta la animación de barrido horizontal.
 */
export function WipeTransition(): ReactElement {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  const trigger = useCallback(
    async (callback: WipeCallback): Promise<void> => {
      const el = scope.current;
      if (!el) {
        await callback();
        return;
      }

      // Captura el color del tema actual antes de modificarlo
      el.style.backgroundColor = getPanelColor();
      // Permite eventos de puntero mientras cubre para evitar clicks accidentales
      el.style.pointerEvents = "auto";

      // Fase 1 — entra desde la izquierda cubriendo la pantalla
      await animate(el, { x: "0%" }, { duration: 0.24, ease: [0.76, 0, 0.24, 1] });

      // Aplica el cambio de estado mientras todo está oculto
      await callback();

      // Fase 2 — sale hacia la derecha revelando el nuevo estado
      await animate(el, { x: "100%" }, { duration: 0.32, ease: [0.76, 0, 0.24, 1] });

      // Resetea la posición y desactiva eventos para el siguiente uso
      animate(el, { x: "-100%" }, { duration: 0 });
      el.style.pointerEvents = "none";
    },
    [animate, scope]
  );

  useEffect(() => {
    _trigger = trigger;
    return () => {
      _trigger = null;
    };
  }, [trigger]);

  return (
    <div
      ref={scope}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        transform: "translateX(-100%)",
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
}
