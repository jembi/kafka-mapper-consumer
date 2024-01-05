import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import debounce from "lodash.debounce";
import axios, { AxiosResponse } from "axios";
import { Bundle, FhirResource } from "fhir/r4";

export const apiClient = axios.create({
  withCredentials: true,
  // TODO: retrieve the base URL from the environment
  baseURL: "https://localhost:8080/",
});

/**
 * Represents a column mapping in the FhirMapperConfigProvider.
 */
export interface ColumnMapping {
  columnName: string;
  fhirPath: string;
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
    setTables((prevTables) => [...prevTables, table]);
  };
  // Fetch the initial config from the API using Axios
  const fetchInitialConfig = async () => {
    try {
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
    expression: ColumnMapping
  ) => {
    const currentMappingIdx = mappingSchema.findIndex(
      (mapping) => mapping.resourceType === activeFhirResource.resourceType
    );
    if (currentMappingIdx !== -1) {
      // Resource type has been mapped already
      const currentMapping = { ...mappingSchema[currentMappingIdx] };
      const table = currentMapping.tableMappings.find(
        (table) => table.targetTable === targetTable
      );
      if (table) {
        // Target table already exists
        currentMapping.tableMappings = currentMapping.tableMappings.filter(
          (table) => table.targetTable !== targetTable
        );
        currentMapping.tableMappings.push({
          targetTable,
          columnMappings: [
            ...table.columnMappings,
            {
              columnName: expression.columnName,
              fhirPath: expression.fhirPath,
            },
          ],
        });
      } else {
        // New target table mapping
        currentMapping.tableMappings.push({
          targetTable,
          columnMappings: [
            {
              columnName: expression.columnName,
              fhirPath: expression.fhirPath,
            },
          ],
        });
      }
      // Update the state
      setMappingSchema((prevMappingSchema) => {
        const newMappingSchema = [...prevMappingSchema];
        newMappingSchema[currentMappingIdx] = currentMapping;
        return newMappingSchema;
      });
    } else {
      // Resource type has not been mapped yet
      setMappingSchema((prevMappingSchema) => {
        const newMappingSchema = [...prevMappingSchema];
        newMappingSchema.push({
          resourceType: activeFhirResource.resourceType,
          tableMappings: [
            {
              targetTable,
              columnMappings: [expression],
            },
          ],
        });
        return newMappingSchema;
      });
    }
  };

  /**
   * Updates the configuration on the server with the provided mapping schema.
   * @param mappingSchema - The updated mapping schema to be applied.
   */
  const updateConfigOnServer = () => {
    setLoading(true);
    const updatedMediatorConfig = {
      // copy all existing config properties
      ...mediatorConfig,
      // bump the config version
      version: mediatorConfig
        ? `${parseInt(mediatorConfig.version.split(".")[0]) + 1}.0.0`
        : "0.1.0",
      config: {
        ...mediatorConfig?.config, // copy all existing config properties
        fhirMappings: JSON.stringify(mappingSchema), // overwrite the fhirMappings
      },
    };
    apiClient
      .post("mediators/", updatedMediatorConfig)
      .then((response) => {
        // TODO: handle response status
        if (response.status >= 200 && response.status < 300) {
          window.alert("Config updated successfully.");
        }
      })
      .catch((error) => {
        console.error("Error updating config:", error);
        window.alert("Error updating config:" + error);
      });
  };

  const clearConfig = () => {
    setLoading(true);
    setMediatorConfig(null);
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
