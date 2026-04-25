import type { ReactElement, SVGProps } from "react";

import type { DatabaseEngineId } from "../../../shared/database-engines";

type EngineGlyphProps = SVGProps<SVGSVGElement>;

/**
 * Marca visual de PostgreSQL representada como elefante minimalista.
 * @param props - Atributos SVG para tamaño y color hereditarios.
 * @returns Elemento SVG listo para usarse en tarjetas de motor.
 */
function PostgresGlyph(props: EngineGlyphProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path
        d="M5.5 6.4c1.4-2 4.1-2.6 6.7-2.4 2.7.2 5 1.2 6.6 3 1.6 1.9 1.5 4.6.6 7-.9 2.5-2.6 4.7-4.5 5.6-1.4.7-2.7.4-3.5-.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M9 5.5c-2 1-3.4 3.4-3 6.5.4 3.1 2.3 5.7 4.8 6.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M12.4 9.6c.6 1.6.4 3.2-.3 4.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="14.6" cy="9.4" r="0.85" fill="currentColor" />
    </svg>
  );
}

/**
 * Marca visual de Redis representada como cubo apilado.
 * @param props - Atributos SVG estándar.
 * @returns Elemento SVG con el icono de Redis.
 */
function RedisGlyph(props: EngineGlyphProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path
        d="M12 3.5 3.8 7l8.2 3.4L20.2 7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M3.8 11.5 12 15l8.2-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M3.8 16 12 19.5 20.2 16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Marca visual de MariaDB con perfil estilizado del leoncillo marino.
 * @param props - Atributos SVG estándar.
 * @returns Elemento SVG decorativo de MariaDB.
 */
function MariaDbGlyph(props: EngineGlyphProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path
        d="M3.5 18c1.4-3 3.4-5.4 6.4-7 2.6-1.4 5.6-1.7 8.6-2.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M20 7c-1.4 1.6-3.6 2.4-5.6 2.6-2.6.3-5 .8-6.7 3.4-1 1.5-1.6 3.2-2.5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="18.6" cy="6.4" r="0.9" fill="currentColor" />
    </svg>
  );
}

/**
 * Marca visual de MySQL representada como delfín minimalista.
 * @param props - Atributos SVG estándar.
 * @returns Elemento SVG decorativo de MySQL.
 */
function MysqlGlyph(props: EngineGlyphProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path
        d="M3.5 14.5c2-.4 4.6-.8 6.5.4 1.6 1 2.3 2.7 4 3.6 1.5.8 3.4.7 5-.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M5 9c1.4-2.2 4-3.6 6.6-3.4 2.8.2 5 1.8 6.4 4 1 1.6 1.5 3.4 1.6 5.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="15.4" cy="8.6" r="0.85" fill="currentColor" />
    </svg>
  );
}

const ENGINE_GLYPHS: Record<DatabaseEngineId, (props: EngineGlyphProps) => ReactElement> = {
  postgresql: PostgresGlyph,
  redis: RedisGlyph,
  mariadb: MariaDbGlyph,
  mysql: MysqlGlyph
};

interface EngineGlyphResolverProps extends EngineGlyphProps {
  engineId: DatabaseEngineId;
}

/**
 * Selecciona la marca SVG adecuada según el motor solicitado.
 * @param props - Identificador del motor más atributos SVG estándar.
 * @returns Marca visual del motor para integrarse en tarjetas.
 */
export function EngineGlyph({ engineId, ...props }: EngineGlyphResolverProps): ReactElement {
  const Glyph = ENGINE_GLYPHS[engineId];
  return <Glyph {...props} />;
}
