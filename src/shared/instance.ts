import type { DatabaseEngineId } from "./database-engines";

export type InstanceStatus = "running" | "stopped" | "error";

/**
 * Registro normalizado de un contenedor gestionado por DataDaphne.
 * Se extrae de las etiquetas Docker para no depender de un almacén externo.
 */
export interface InstanceRecord {
  id: string;
  containerId: string;
  name: string;
  engineId: DatabaseEngineId;
  engineLabel: string;
  image: string;
  port: number;
  status: InstanceStatus;
  createdAt: string;
  /** Cadena de conexión lista para copiar, generada a partir de las etiquetas del contenedor. */
  connectionString: string;
}

/**
 * Payload que envía la UI cuando el usuario pulsa Crear en una tarjeta de motor.
 * Los valores corresponden directamente a los configOptions del motor elegido.
 */
export interface CreateInstancePayload {
  engineId: DatabaseEngineId;
  instanceName: string;
  values: Record<string, string | number | boolean>;
}

/**
 * Resultado devuelto al renderer tras intentar crear una instancia.
 */
export interface CreateInstanceResult {
  success: boolean;
  instance?: InstanceRecord;
  error?: string;
}

/**
 * Resultado genérico para operaciones de parar o eliminar un contenedor.
 */
export interface ContainerOperationResult {
  success: boolean;
  error?: string;
}
