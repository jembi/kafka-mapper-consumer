import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { Bundle, FhirResource } from "fhir/r4";

async function initializeApiClient(): Promise<void> {
  try {
    const response = await fetch("/config/default.json");
    const config: Config = await response.json();
    let hostPath = config.hostPath || "";
    if (hostPath) {
      hostPath = "/" + hostPath.replace(/(^\/)|(\/$)/g, "");
    }
    // Initialize apiClient with the correct baseURL
    apiClient = axios.create({
      withCredentials: true,
      baseURL: `${config.protocol}://${config.host}:${config.port}${hostPath}`,
    });
  } catch (error) {
    console.error("Error initializing the API client:", error);
    throw error;
  }
}
// Variable to hold the initialized apiClient
let apiClient = axios.create();

// Call initializeApiClient to setup apiClient before using it
const initializationPromise = initializeApiClient().catch(console.error);
/**
 * Represents a column mapping in the FhirMapperConfigProvider.
 */
export interface ColumnMapping {
  columnName: string;
  fhirPath: string;
}

interface Config {
  protocol: string;
  host: string;
  port: number;
  hostPath?: string;
}
/**
 * Represents an expression used in column mapping.
 */
export interface Expression extends ColumnMapping {
  resourceType: FhirResource["resourceType"];
  table?: string;
}

// Define the mapping schema item type
export interface MappingSchemaItem {
  resourceType: string;
  tableMappings: {
    targetTable: string;
    columnMappings: ColumnMapping[];
  }[];
}

// Define the mediator config type
export interface MediatorConfig {
  _id: string;
  urn: string;
  version: string;
  name: string;
  endpoints: {
    name: string;
    type: string;
    status: string;
    host: string;
    port: number;
    forwardAuthHeader: boolean;
    _id: string;
  }[];
  configDefs: {
    param: string;
    displayName: string;
    description: string;
    type: string;
    values: any[];
    template: any[];
    _id: string;
  }[];
  config: {
    fhirMappings: MappingSchemaItem[];
  };
  defaultChannelConfig: any[];
  __v: number;
  _lastHeartbeat: string;
  _uptime: number;
  _configModifiedTS: string;
}

// Define the context type
interface FhirMapperContextType {
  mappingSchema: MappingSchemaItem[];
  tables: string[];
  addTable: (_tableName: string) => void;
  removeTable: (_tableName: string) => void;
  addMappingSchemaItem: (
    targetTable: string,
    expression: ColumnMapping
  ) => void;
  getMappingsByTable: (table: string) => ColumnMapping[];
  fhirBundle: Bundle<FhirResource> | null;
  setFhirBundle: (bundle: Bundle<FhirResource>) => void;
  activeFhirResource: FhirResource | null;
  setActiveFhirResource: (resource: FhirResource) => void;
  expressions: Expression[];
  addExpression: (expression: Expression) => void;
  removeExpression: (columnName: string) => void;
  mediatorConfig: MediatorConfig | null;
  updateConfigOnServer: () => void;
  clearConfig: () => void;
}

// Create the context
const FhirMapperConfigContext = createContext<FhirMapperContextType>({
  mappingSchema: [],
  tables: [],
  addTable: (_table: string) => {},
  removeTable: (_table: string) => {},
  addMappingSchemaItem: (
    _targetTable: string,
    _expression: ColumnMapping
  ) => {},
  getMappingsByTable: () => {
    return [];
  },
  fhirBundle: null,
  setFhirBundle: (_bundle: Bundle<FhirResource>) => {},
  activeFhirResource: null,
  setActiveFhirResource: (_resource: FhirResource) => {},
  expressions: [],
  addExpression: (_expression: Expression) => {},
  removeExpression: (_columnName: string) => {},
  mediatorConfig: null,
  updateConfigOnServer: () => {},
  clearConfig: () => {},
});

// Define the provider component
interface FhirMapperConfigProviderProps {
  children: JSX.Element;
}

// Define the provider component
const FhirMapperConfigProvider: React.FC<FhirMapperConfigProviderProps> = ({
  children,
}: FhirMapperConfigProviderProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  // mediatorConfig is used to store the mediator config fetched from the server
  const [mediatorConfig, setMediatorConfig] = useState<MediatorConfig>(null);
  // mappingSchema is used to store the mapping schema
  const [mappingSchema, setMappingSchema] = useState<MappingSchemaItem[]>([]);
  // fhirBundle is used to store the FHIR bundle fetched from the server
  // activeFhirResource is used to store the FHIR resource selected by the user
  const [fhirBundle, setFhirBundle] = useState<Bundle<FhirResource>>(null);
  const [activeFhirResource, setActiveFhirResource] =
    useState<FhirResource>(null);
  // expressions are used to store the fhirpath expressions added by the user
  const [expressions, setExpressions] = useState<Expression[]>([]);
  const addExpression = (expression: Expression) => {
    setExpressions((prevExpressions) => [...prevExpressions, expression]);
  };
  const removeExpression = (columnName: string) => {
    setExpressions((prevExpressions) =>
      prevExpressions.filter(
        (expression) => expression.columnName !== columnName
      )
    );
  };

  // tables are used to store the tables used in the mapping schema
  const [tables, setTables] = useState<string[]>([]);
  const addTable = (table: string) => {
    const isTableExist = mappingSchema.some((item) => {
      return item.tableMappings.some(
        (mapping) => mapping.targetTable === table
      );
    });

    if (isTableExist) {
      // Table exists in the mappingSchema
      throw new Error("Table already exists in the mapping schema.");
    } else {
      // Table does not exist in the mappingSchema
      setTables((prevTables) => [...prevTables, table]);
    }
  };
  const removeTable = (table: string) => {
    setTables((prevTables) => prevTables.filter((t) => t !== table));
    removeTargetTable(table);
  };
  const removeTargetTable = (table: string) => {
    setMappingSchema((prevMappingSchema) => {
      const updatedSchema = prevMappingSchema.map((item) => {
        const updatedTableMappings = item.tableMappings.filter(
          (mapping) => mapping.targetTable !== table
        );
        return { ...item, tableMappings: updatedTableMappings };
      });
      return updatedSchema;
    });
  };

  // Fetch the initial config from the API using Axios
  const fetchInitialConfig = async () => {
    try {
      await initializationPromise;
      const response = await apiClient.get<MediatorConfig>(
        "mediators/urn:openhim-mediator:kafka-mapper-consumer"
      );
      setMediatorConfig(response.data);
      const initialMappingSchema: MappingSchemaItem[] = JSON.parse(
        response.data.config.fhirMappings as unknown as string
      );
      setMappingSchema(initialMappingSchema);
      if (Array.isArray(initialMappingSchema)) {
        const usedTables = initialMappingSchema
          .reduce((acc, curr) => {
            return acc.concat(
              curr.tableMappings.map((table) => table.targetTable)
            );
          }, [])
          .filter((table, index, self) => self.indexOf(table) === index);
        setTables(usedTables);
        setLoading(false);
      } else {
        console.error(
          "initialMappingSchema is not an array: ",
          initialMappingSchema
        );
      }
    } catch (error) {
      console.error("Error fetching initial config:", error);
      window.alert("Error fetching initial config:" + error.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchInitialConfig();
  }, []);

  /**
   * Retrieves the mappings for a given table.
   *
   * @param table - The name of the table.
   * @returns An array of column mappings for the specified table.
   */
  const getMappingsByTable = useCallback(
    (table: string) => {
      return Array.isArray(mappingSchema)
        ? mappingSchema.reduce((acc, item) => {
            const mappings = item.tableMappings
              .filter(({ targetTable }) => targetTable === table)
              .map(({ columnMappings }) => {
                return columnMappings;
              })
              .flat();
            return acc.concat(mappings);
          }, [])
        : [];
    },
    [mappingSchema, activeFhirResource, tables]
  );

  // Function to add an item to the mappingSchema
  const addMappingSchemaItem = (
    targetTable: string,
    { columnName, fhirPath }: ColumnMapping
  ) => {
    setMappingSchema((prevMappingSchema) => {
      const currentMappingIdx = prevMappingSchema.findIndex(
        (mapping) => mapping.resourceType === activeFhirResource.resourceType
      );

      if (currentMappingIdx !== -1) {
        const currentMapping = { ...prevMappingSchema[currentMappingIdx] };
        const currentTableMappingIdx = currentMapping.tableMappings.findIndex(
          (tableMapping) => tableMapping.targetTable === targetTable
        );

        if (currentTableMappingIdx !== -1) {
          const currentTableMapping = {
            ...currentMapping.tableMappings[currentTableMappingIdx],
          };
          const currentColumnMappingIdx =
            currentTableMapping.columnMappings.findIndex(
              (columnMapping) => columnMapping.columnName === columnName
            );

          if (currentColumnMappingIdx !== -1) {
            // If columnName already exists, update its fhirPath
            window.alert(
              columnName +
                " already exists in the mapping schema. the fhirPath will be overwritten using the value of the recent expression."
            );
            currentTableMapping.columnMappings[
              currentColumnMappingIdx
            ].fhirPath = fhirPath;
          } else {
            // If columnName does not exist, add new columnMapping
            currentTableMapping.columnMappings.push({ columnName, fhirPath });
          }

          currentMapping.tableMappings.splice(
            currentTableMappingIdx,
            1,
            currentTableMapping
          );
        } else {
          // If targetTable does not exist, add new tableMapping
          currentMapping.tableMappings.push({
            targetTable,
            columnMappings: [{ columnName, fhirPath }],
          });
        }

        return [
          ...prevMappingSchema.slice(0, currentMappingIdx),
          currentMapping,
          ...prevMappingSchema.slice(currentMappingIdx + 1),
        ];
      } else {
        // If the ResourceType has not been mapped yet, add new mapping
        return [
          ...prevMappingSchema,
          {
            resourceType: activeFhirResource.resourceType,
            tableMappings: [
              {
                targetTable,
                columnMappings: [{ columnName, fhirPath }],
              },
            ],
          },
        ];
      }
    });
  };

  /**
   * Updates the configuration on the server with the provided mapping schema.
   * @param mappingSchema - The updated mapping schema to be applied.
   */
  const updateConfigOnServer = async () => {
    setLoading(true);

    const newMediatorConfig = {
      fhirMappings: JSON.stringify(mappingSchema),
    };
    const mediatorUrn = mediatorConfig.urn;
    try {
      await initializationPromise;
      const response = await apiClient.put(
        `/mediators/${mediatorUrn}/config`,
        newMediatorConfig
      );
      // TODO: handle response status
      if (response.status >= 200 && response.status < 300) {
        window.alert("Config updated successfully.");
      }
    } catch (error) {
      console.error("Error updating config:", error);
      window.alert("Error updating config:" + error);
    }
  };

  const clearConfig = () => {
    setLoading(true);
    setMediatorConfig(null);
    fetchInitialConfig();
    setMappingSchema([]);
    setFhirBundle(null);
    setActiveFhirResource(null);
    setExpressions([]);
    setTables([]);
    setLoading(false);
  };

  return (
    <>
      {/* @ts-ignore */}
      <FhirMapperConfigContext.Provider
        value={{
          mappingSchema,
          addMappingSchemaItem,
          getMappingsByTable,
          tables,
          addTable,
          removeTable,
          fhirBundle,
          setFhirBundle,
          activeFhirResource,
          setActiveFhirResource,
          expressions,
          addExpression,
          removeExpression,
          mediatorConfig,
          updateConfigOnServer,
          clearConfig,
        }}
      >
        {children}
      </FhirMapperConfigContext.Provider>
    </>
  );
};

// Custom hook to access the context
const useFhirMapperConfig = () => {
  const context = useContext(FhirMapperConfigContext);
  if (context === undefined) {
    throw new Error(
      "useFhirMapperConfig must be used within a FhirMapperConfigProvider"
    );
  }
  return context;
};

export { FhirMapperConfigProvider, useFhirMapperConfig };
