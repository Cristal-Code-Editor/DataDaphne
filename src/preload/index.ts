import { contextBridge, ipcRenderer } from "electron";

import type { DatabaseEngineDefinition } from "../shared/database-engines";
import type { DockerStatus } from "../shared/docker-status";
import type { ContainerOperationResult, CreateInstancePayload, CreateInstanceResult, InstanceRecord } from "../shared/instance";
import { IPC_CHANNELS } from "../shared/ipc-channels";

export interface DataDaphneApi {
  getDockerStatus: () => Promise<DockerStatus>;
  getDatabaseEngines: () => Promise<DatabaseEngineDefinition[]>;
  createInstance: (payload: CreateInstancePayload) => Promise<CreateInstanceResult>;
  listInstances: () => Promise<InstanceRecord[]>;
  stopInstance: (containerId: string) => Promise<ContainerOperationResult>;
  removeInstance: (containerId: string) => Promise<ContainerOperationResult>;
}

const api: DataDaphneApi = {
  /**
   * Solicita al proceso principal el estado actual de Docker Desktop.
   * @returns Estado normalizado de disponibilidad y versión de Docker.
   */
  getDockerStatus: () => ipcRenderer.invoke(IPC_CHANNELS.dockerStatus),

  /**
   * Obtiene el catálogo de motores soportados por DataDaphne.
   * @returns Lista de motores disponibles para crear instancias locales.
   */
  getDatabaseEngines: () => ipcRenderer.invoke(IPC_CHANNELS.databaseEngines),

  /**
   * Solicita al proceso principal crear y arrancar un contenedor Docker.
   * @param payload - Motor, nombre y configuración elegida por el usuario.
   * @returns Resultado con la instancia creada o el mensaje de error.
   */
  createInstance: (payload) => ipcRenderer.invoke(IPC_CHANNELS.containerCreate, payload),

  /**
   * Lista todos los contenedores gestionados por DataDaphne en el sistema.
   * @returns Instancias activas y detenidas con su estado normalizado.
   */
  listInstances: () => ipcRenderer.invoke(IPC_CHANNELS.containerList),

  /**
   * Detiene un contenedor sin eliminarlo.
   * @param containerId - ID completo del contenedor a detener.
   * @returns Resultado de la operación.
   */
  stopInstance: (containerId) => ipcRenderer.invoke(IPC_CHANNELS.containerStop, containerId),

  /**
   * Elimina permanentemente un contenedor gestionado por DataDaphne.
   * @param containerId - ID completo del contenedor a eliminar.
   * @returns Resultado de la operación.
   */
  removeInstance: (containerId) => ipcRenderer.invoke(IPC_CHANNELS.containerRemove, containerId)
};

contextBridge.exposeInMainWorld("datadaphne", api);
