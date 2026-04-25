export const IPC_CHANNELS = {
  dockerStatus: "docker:status",
  databaseEngines: "database:engines",
  containerCreate: "container:create",
  containerList: "container:list",
  containerStart: "container:start",
  containerStop: "container:stop",
  containerRemove: "container:remove",
  containerLogsStart: "container:logs:start",
  containerLogsChunk: "container:logs:chunk",
  containerLogsStop: "container:logs:stop",
  portCheck: "port:check"
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
