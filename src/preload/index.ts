import { contextBridge, ipcRenderer } from "electron";
import type { IpcRendererEvent } from "electron";

import type { DatabaseEngineDefinition } from "../shared/database-engines";
import type { DockerStatus } from "../shared/docker-status";
import type { ContainerOperationResult, CreateInstancePayload, CreateInstanceResult, InstanceRecord } from "../shared/instance";
import { IPC_CHANNELS } from "../shared/ipc-channels";

export interface DataDaphneApi {
  getDockerStatus: () => Promise<DockerStatus>;
  getDatabaseEngines: () => Promise<DatabaseEngineDefinition[]>;
  createInstance: (payload: CreateInstancePayload) => Promise<CreateInstanceResult>;
  listInstances: () => Promise<InstanceRecord[]>;
  startInstance: (containerId: string) => Promise<ContainerOperationResult>;
  stopInstance: (containerId: string) => Promise<ContainerOperationResult>;
  removeInstance: (containerId: string) => Promise<ContainerOperationResult>;
  startLogs: (containerId: string) => Promise<ContainerOperationResult>;
  stopLogs: (containerId: string) => Promise<ContainerOperationResult>;
  onLogsChunk: (callback: (data: { containerId: string; line: string }) => void) => () => void;
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
   * Arranca un contenedor que estaba detenido.
   * @param containerId - ID completo del contenedor a iniciar.
   * @returns Resultado de la operación.
   */
  startInstance: (containerId) => ipcRenderer.invoke(IPC_CHANNELS.containerStart, containerId),

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
  removeInstance: (containerId) => ipcRenderer.invoke(IPC_CHANNELS.containerRemove, containerId),

  /**
   * Arranca la transmisión de logs de un contenedor hacia el renderer.
   * @param containerId - ID completo del contenedor.
   * @returns Resultado de la operación.
   */
  startLogs: (containerId) => ipcRenderer.invoke(IPC_CHANNELS.containerLogsStart, containerId),

  /**
   * Detiene la transmisión de logs activa para el contenedor indicado.
   * @param containerId - ID completo del contenedor.
   * @returns Resultado de la operación.
   */
  stopLogs: (containerId) => ipcRenderer.invoke(IPC_CHANNELS.containerLogsStop, containerId),

  /**
   * Suscribe un callback a los fragmentos de log enviados por el proceso principal.
   * @param callback - Función que recibe cada línea con su containerId.
   * @returns Función de limpieza que elimina el listener.
   */
  onLogsChunk: (callback) => {
    const handler = (_: IpcRendererEvent, data: { containerId: string; line: string }) =>
      callback(data);
    ipcRenderer.on(IPC_CHANNELS.containerLogsChunk, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.containerLogsChunk, handler);
  }
};

contextBridge.exposeInMainWorld("datadaphne", api);
