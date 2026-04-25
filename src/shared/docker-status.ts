export interface DockerStatus {
  available: boolean;
  version: string | null;
  message: string;
}
