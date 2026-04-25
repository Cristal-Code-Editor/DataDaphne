export const IPC_CHANNELS = {
  dockerStatus: "docker:status",
  databaseEngines: "database:engines",
  containerCreate: "container:create",
  containerList: "container:list",
  containerStop: "container:stop",
  containerRemove: "container:remove"
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
