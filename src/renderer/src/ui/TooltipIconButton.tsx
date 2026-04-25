import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { Tooltip } from "radix-ui";

interface TooltipIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  active?: boolean;
  className?: string;
}

/**
 * Renderiza un botón compacto con tooltip accesible para controles de icono.
 * @param props - Propiedades visuales, etiqueta accesible y contenido SVG del botón.
 * @returns Botón con tooltip integrado para acciones de la UI.
 */
export function TooltipIconButton({
  label,
  children,
  active = false,
  className = "icon-button",
  ...props
}: TooltipIconButtonProps): ReactElement {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button aria-label={label} className={className} data-active={active} type="button" {...props}>
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="tooltip-content" sideOffset={8}>
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
