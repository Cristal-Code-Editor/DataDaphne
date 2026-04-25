import Docker from "dockerode";

import type { DockerStatus } from "../../shared/docker-status";

/**
 * Crea un cliente Docker compatible con Windows y Unix para consultar el motor local.
 * @returns Cliente Docker configurado para hablar con Docker Desktop o el socket local.
 */
function createDockerClient(): Docker {
  if (process.platform === "win32") {
    return new Docker({ socketPath: "//./pipe/docker_engine" });
  }

  return new Docker({ socketPath: "/var/run/docker.sock" });
}

/**
 * Consulta el estado de Docker sin bloquear el arranque visual de la aplicación.
 * Incluye un timeout de 3 s para no dejar la UI colgada si el daemon no responde.
 * @returns Estado normalizado para que la UI pueda decidir si habilita acciones.
 */
export async function getDockerStatus(): Promise<DockerStatus> {
  try {
    const docker = createDockerClient();
    const version = await Promise.race([
      docker.version(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 3000)
      )
    ]);

    return {
      available: true,
      version: version.Version ?? null,
      message: "Docker Desktop está disponible."
    };
  } catch {
    return {
      available: false,
      version: null,
      message: "Docker Desktop no está disponible o no se encuentra en ejecución."
    };
  }
}
