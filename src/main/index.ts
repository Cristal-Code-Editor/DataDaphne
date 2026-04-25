import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";

import { getDockerStatus } from "./docker/docker-service";
import { createInstance, listInstances, removeInstance, startInstance, startLogStream, stopInstance, stopLogStream } from "./docker/container-service";
import { DATABASE_ENGINES } from "../shared/database-engines";
import { IPC_CHANNELS } from "../shared/ipc-channels";
import type { CreateInstancePayload } from "../shared/instance";

/**
 * Registra los canales IPC estables que comunican la UI con el proceso principal.
 * @returns No retorna valor; deja los handlers disponibles durante la sesión.
 */
function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.dockerStatus, getDockerStatus);
  ipcMain.handle(IPC_CHANNELS.databaseEngines, () => DATABASE_ENGINES);
  ipcMain.handle(IPC_CHANNELS.containerCreate, (_event, payload: CreateInstancePayload) => createInstance(payload));
  ipcMain.handle(IPC_CHANNELS.containerList, listInstances);
  ipcMain.handle(IPC_CHANNELS.containerStart, (_event, containerId: string) => startInstance(containerId));
  ipcMain.handle(IPC_CHANNELS.containerStop, (_event, containerId: string) => stopInstance(containerId));
  ipcMain.handle(IPC_CHANNELS.containerRemove, (_event, containerId: string) => removeInstance(containerId));
  ipcMain.handle(IPC_CHANNELS.containerLogsStart, (event, containerId: string) =>
    startLogStream(containerId, (line) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send(IPC_CHANNELS.containerLogsChunk, { containerId, line });
      }
    })
  );
  ipcMain.handle(IPC_CHANNELS.containerLogsStop, (_event, containerId: string) => stopLogStream(containerId));
}

/**
 * Construye la ventana principal con aislamiento habilitado para proteger la UI.
 * @returns Ventana principal de DataDaphne.
 */
function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1080,
    minHeight: 720,
    title: "DataDaphne",
    backgroundColor: "#f7f4ee",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    window.loadFile(join(__dirname, "../renderer/index.html"));
  }

  return window;
}

registerIpcHandlers();

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
