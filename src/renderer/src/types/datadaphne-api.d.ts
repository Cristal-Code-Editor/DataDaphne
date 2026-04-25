import type { DataDaphneApi } from "../../../preload";

declare global {
  interface Window {
    datadaphne: DataDaphneApi;
  }
}

export {};
