export type DatabaseEngineId = "postgresql" | "redis" | "mariadb" | "mysql";

export type DatabaseEngineKind = "relational" | "key-value";

export interface DatabaseConfigOption {
  key: string;
  labelKey: string;
  type: "text" | "password" | "number" | "boolean" | "select";
  defaultValue: string | number | boolean;
  required: boolean;
}

export interface DatabaseEngineDefinition {
  id: DatabaseEngineId;
  label: string;
  kind: DatabaseEngineKind;
  dockerImage: string;
  defaultPort: number;
  accent: string;
  configOptions: DatabaseConfigOption[];
}

export const DATABASE_ENGINES: DatabaseEngineDefinition[] = [
  {
    id: "postgresql",
    label: "PostgreSQL",
    kind: "relational",
    dockerImage: "postgres:16-alpine",
    defaultPort: 5432,
    accent: "#336791",
    configOptions: [
      {
        key: "database",
        labelKey: "engineConfig.databaseName",
        type: "text",
        defaultValue: "datadaphne",
        required: true
      },
      {
        key: "username",
        labelKey: "engineConfig.username",
        type: "text",
        defaultValue: "postgres",
        required: true
      },
      {
        key: "password",
        labelKey: "engineConfig.password",
        type: "password",
        defaultValue: "postgres",
        required: true
      },
      {
        key: "port",
        labelKey: "engineConfig.port",
        type: "number",
        defaultValue: 5432,
        required: true
      }
    ]
  },
  {
    id: "redis",
    label: "Redis",
    kind: "key-value",
    dockerImage: "redis:7-alpine",
    defaultPort: 6379,
    accent: "#D82C20",
    configOptions: [
      {
        key: "port",
        labelKey: "engineConfig.port",
        type: "number",
        defaultValue: 6379,
        required: true
      },
      {
        key: "appendOnly",
        labelKey: "engineConfig.appendOnly",
        type: "boolean",
        defaultValue: true,
        required: false
      }
    ]
  },
  {
    id: "mariadb",
    label: "MariaDB",
    kind: "relational",
    dockerImage: "mariadb:11",
    defaultPort: 3307,
    accent: "#003545",
    configOptions: [
      {
        key: "database",
        labelKey: "engineConfig.databaseName",
        type: "text",
        defaultValue: "datadaphne",
        required: true
      },
      {
        key: "rootPassword",
        labelKey: "engineConfig.rootPassword",
        type: "password",
        defaultValue: "mariadb",
        required: true
      },
      {
        key: "port",
        labelKey: "engineConfig.port",
        type: "number",
        defaultValue: 3307,
        required: true
      }
    ]
  },
  {
    id: "mysql",
    label: "MySQL",
    kind: "relational",
    dockerImage: "mysql:8",
    defaultPort: 3306,
    accent: "#00758F",
    configOptions: [
      {
        key: "database",
        labelKey: "engineConfig.databaseName",
        type: "text",
        defaultValue: "datadaphne",
        required: true
      },
      {
        key: "rootPassword",
        labelKey: "engineConfig.rootPassword",
        type: "password",
        defaultValue: "mysql",
        required: true
      },
      {
        key: "port",
        labelKey: "engineConfig.port",
        type: "number",
        defaultValue: 3306,
        required: true
      }
    ]
  }
];
