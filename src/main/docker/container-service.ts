import Docker from "dockerode";

import { DATABASE_ENGINES } from "../../shared/database-engines";
import type { DatabaseEngineId } from "../../shared/database-engines";
import type {
  ContainerOperationResult,
  CreateInstancePayload,
  CreateInstanceResult,
  InstanceRecord,
  InstanceStatus
} from "../../shared/instance";

const DATADAPHNE_LABEL = "datadaphne.managed";

/**
 * Crea un cliente Docker compatible con Windows y Unix.
 * @returns Cliente Docker apuntando al socket local del sistema operativo.
 */
function createDockerClient(): Docker {
  if (process.platform === "win32") {
    return new Docker({ socketPath: "//./pipe/docker_engine" });
  }
  return new Docker({ socketPath: "/var/run/docker.sock" });
}

/**
 * Descarga una imagen de Docker Hub si no está disponible localmente.
 * Sigue el stream de progreso hasta que termina o falla.
 * @param docker - Cliente Docker activo.
 * @param image - Nombre completo de la imagen a descargar.
 * @returns Promesa resuelta cuando la descarga finaliza.
 */
async function pullImage(docker: Docker, image: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (docker as any).pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) {
        reject(err);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (docker as any).modem.followProgress(stream, (progressErr: Error | null) => {
        if (progressErr) {
          reject(progressErr);
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Construye las variables de entorno según el motor y los valores configurados.
 * @param engineId - Identificador del motor de base de datos.
 * @param values - Valores del formulario del usuario.
 * @returns Array de strings con formato KEY=value para Docker.
 */
function buildEnvVars(engineId: DatabaseEngineId, values: Record<string, string | number | boolean>): string[] {
  switch (engineId) {
    case "postgresql":
      return [
        `POSTGRES_DB=${values.database ?? "datadaphne"}`,
        `POSTGRES_USER=${values.username ?? "postgres"}`,
        `POSTGRES_PASSWORD=${values.password ?? "postgres"}`
      ];
    case "redis":
      return [];
    case "mariadb":
      return [
        `MARIADB_ROOT_PASSWORD=${values.rootPassword ?? "mariadb"}`,
        `MARIADB_DATABASE=${values.database ?? "datadaphne"}`
      ];
    case "mysql":
      return [
        `MYSQL_ROOT_PASSWORD=${values.rootPassword ?? "mysql"}`,
        `MYSQL_DATABASE=${values.database ?? "datadaphne"}`
      ];
  }
}

/**
 * Construye el comando de arranque personalizado según las opciones del motor.
 * Actualmente solo Redis usa argumentos adicionales para la persistencia AOF.
 * @param engineId - Identificador del motor.
 * @param values - Valores del formulario del usuario.
 * @returns Array de strings con el comando o vacío si Docker usa el CMD por defecto.
 */
function buildCmd(engineId: DatabaseEngineId, values: Record<string, string | number | boolean>): string[] {
  if (engineId === "redis" && values.appendOnly === true) {
    return ["redis-server", "--appendonly", "yes"];
  }
  return [];
}

/**
 * Garantiza que el nombre del contenedor cumpla las restricciones de Docker.
 * Solo permite letras, dígitos, guiones, puntos y guiones bajos.
 * @param name - Nombre elegido por el usuario.
 * @returns Nombre sanitizado compatible con el daemon de Docker.
 */
function sanitizeName(name: string): string {
  const sanitized = name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  return /^[a-zA-Z0-9]/.test(sanitized) ? sanitized : `dd_${sanitized}`;
}

/**
 * Convierte el estado de un contenedor Docker al tipo normalizado de DataDaphne.
 * @param state - Estado reportado por el daemon de Docker.
 * @returns Estado simplificado para la interfaz de usuario.
 */
function normalizeStatus(state: string): InstanceStatus {
  if (state === "running") return "running";
  if (state === "exited" || state === "created") return "stopped";
  return "error";
}

/**
 * Crea y arranca un contenedor para el motor y configuración indicados.
 * Descarga la imagen automáticamente si no está disponible de forma local.
 * @param payload - Motor elegido, nombre de instancia y valores del formulario.
 * @returns Resultado con la instancia creada o el mensaje de error.
 */
export async function createInstance(payload: CreateInstancePayload): Promise<CreateInstanceResult> {
  const engine = DATABASE_ENGINES.find((e) => e.id === payload.engineId);

  if (!engine) {
    return { success: false, error: "Motor no encontrado en el catálogo." };
  }

  const docker = createDockerClient();
  const hostPort = typeof payload.values.port === "number" ? payload.values.port : engine.defaultPort;
  const containerPort = engine.defaultPort;
  const containerName = sanitizeName(payload.instanceName);

  try {
    await pullImage(docker, engine.dockerImage);

    const envVars = buildEnvVars(payload.engineId, payload.values);
    const cmd = buildCmd(payload.engineId, payload.values);

    const container = await docker.createContainer({
      Image: engine.dockerImage,
      name: containerName,
      Env: envVars,
      ...(cmd.length > 0 ? { Cmd: cmd } : {}),
      ExposedPorts: { [`${containerPort}/tcp`]: {} },
      Labels: {
        [DATADAPHNE_LABEL]: "true",
        "datadaphne.engine": payload.engineId,
        "datadaphne.engine.label": engine.label,
        "datadaphne.port": String(hostPort)
      },
      HostConfig: {
        PortBindings: {
          [`${containerPort}/tcp`]: [{ HostPort: String(hostPort) }]
        }
      }
    });

    await container.start({});
    const inspect = await container.inspect();

    return {
      success: true,
      instance: {
        id: inspect.Id.slice(0, 12),
        containerId: inspect.Id,
        name: containerName,
        engineId: payload.engineId,
        engineLabel: engine.label,
        image: engine.dockerImage,
        port: hostPort,
        status: "running",
        createdAt: inspect.Created
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al crear el contenedor.";
    return { success: false, error: message };
  }
}

/**
 * Lista todos los contenedores gestionados por DataDaphne, activos o parados.
 * Filtra por la etiqueta característica para evitar tocar contenedores ajenos.
 * @returns Lista de instancias normalizadas para la interfaz.
 */
export async function listInstances(): Promise<InstanceRecord[]> {
  const docker = createDockerClient();

  try {
    const containers = await docker.listContainers({
      all: true,
      filters: JSON.stringify({ label: [`${DATADAPHNE_LABEL}=true`] })
    });

    return containers.map((c) => ({
      id: c.Id.slice(0, 12),
      containerId: c.Id,
      name: (c.Names[0] ?? "unknown").replace(/^\//, ""),
      engineId: (c.Labels["datadaphne.engine"] ?? "unknown") as DatabaseEngineId,
      engineLabel: c.Labels["datadaphne.engine.label"] ?? "unknown",
      image: c.Image,
      port: parseInt(c.Labels["datadaphne.port"] ?? "0", 10),
      status: normalizeStatus(c.State),
      createdAt: new Date(c.Created * 1000).toISOString()
    }));
  } catch {
    return [];
  }
}

/**
 * Detiene un contenedor en ejecución sin eliminarlo.
 * @param containerId - ID del contenedor a parar.
 * @returns Resultado de la operación con mensaje de error si falla.
 */
export async function stopInstance(containerId: string): Promise<ContainerOperationResult> {
  const docker = createDockerClient();

  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al detener el contenedor.";
    return { success: false, error: message };
  }
}

/**
 * Detiene y elimina permanentemente un contenedor gestionado por DataDaphne.
 * Si el contenedor ya estaba parado, se omite el paso de detención.
 * @param containerId - ID del contenedor a eliminar.
 * @returns Resultado de la operación con mensaje de error si falla.
 */
export async function removeInstance(containerId: string): Promise<ContainerOperationResult> {
  const docker = createDockerClient();

  try {
    const container = docker.getContainer(containerId);

    try {
      await container.stop();
    } catch {
      // El contenedor ya estaba parado, ignoramos el error
    }

    await container.remove();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar el contenedor.";
    return { success: false, error: message };
  }
}
