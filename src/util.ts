import Ajv from "ajv";
import fs from "fs";
import path from "path";
import fhirpath from "fhirpath";
import { Entry, FhirMapping, Table, PluginScript, FhirPlugin, instanceOfTable } from "./types";

const ajv = new Ajv({ allErrors: true, strictTuples: false });
const schema = require("../schema/fhir-mapping.schema.json");
delete schema["$schema"];
const validate = ajv.compile(schema);

const hasUniqueResourceTypes = (fhirMappings: FhirMapping[]): Boolean => {
  const resourceTypes = fhirMappings.map((fhirMapping) => fhirMapping.resourceType);
  const uniqueResourceTypes = [...new Set(resourceTypes)];
  const hasUniqueResourceTypes = uniqueResourceTypes.length === fhirMappings.length;
  return hasUniqueResourceTypes;
};

const getPluginScriptNames = (fhirMappings: FhirMapping[]) => {
  let pluginScriptNames = [];
  fhirMappings.forEach((fhirMapping) => {
    fhirMapping.tableMappings.forEach((tableMapping) => {
      if (tableMapping.plugin) {
        pluginScriptNames.push(tableMapping.plugin);
      }
    });
  });
  const uniquePluginScriptNames = [...new Set(pluginScriptNames)];

  return uniquePluginScriptNames;
};

const validatePluginScriptsExist = (fhirMappings: FhirMapping[]): Error[] => {
  const errors: Error[] = [];
  const pluginScriptNames = getPluginScriptNames(fhirMappings);

  pluginScriptNames.forEach((pluginName) => {
    const doesExist = fs.existsSync(path.resolve(__dirname, `./plugin/${pluginName}`));
    if (!doesExist) errors.push(new Error(`Could not find plugin: "${pluginName}" in the plugin directory`));
  });
  return errors;
};

const validatePluginScriptsFunction = (fhirMappings: FhirMapping[]): Error[] => {
  const errors: Error[] = [];
  const pluginScriptNames = getPluginScriptNames(fhirMappings);

  pluginScriptNames.forEach((pluginName) => {
    const doesExist = fs.existsSync(path.resolve(__dirname, `./plugin/${pluginName}`));
    if (doesExist) {
      try {
        const pluginScript: PluginScript = require(`./plugin/${pluginName}`);
        if (typeof pluginScript?.plugin !== "function") throw new Error("Plugin function is not exported from plugin script");
      } catch (error) {
        if (error?.message) {
          errors.push(new Error(error.message));
        } else {
          errors.push(new Error(`Error occured while trying to load plugin from ${pluginName}`));
        }
      }
    }
  });
  return errors;
};

export const ValidateFhirMappingsJson = (fhirMappings: FhirMapping[]): Error[] => {
  let errors: Error[] = [];

  if (!hasUniqueResourceTypes(fhirMappings)) errors.push(new Error("Duplicate resource type "));

  errors = [...errors, ...validatePluginScriptsExist(fhirMappings)];
  errors = [...errors, ...validatePluginScriptsFunction(fhirMappings)];

  if (!validate(fhirMappings)) {
    errors = [...errors, ...(validate.errors?.map((error) => new Error(error.message)) ?? [])];
  }

  return errors;
};

export const GetFhirPlugins = (fhirMappings: FhirMapping[]): Map<string, FhirPlugin> => {
  const fhirPlugins = new Map<string, FhirPlugin>();
  const pluginScriptNames = getPluginScriptNames(fhirMappings);
  pluginScriptNames.forEach((pluginScriptName) => {
    const pluginScript: PluginScript = require(`./plugin/${pluginScriptName}`);
    fhirPlugins.set(pluginScriptName, pluginScript.plugin);
  });
  return fhirPlugins;
};

const NUM_DEFAULT_RESOURCE_ATTRIBUTES = 3;
const removeEmptyTableMappings = (tables: Table[]): Table[] => tables.filter((table) => Object.keys(table.rows).length > NUM_DEFAULT_RESOURCE_ATTRIBUTES);

const firstOrDefault = (arr: any[], defaultValue: any = null) => (arr?.length > 0 ? arr[0] : defaultValue);

const mapDefaultResourceAttributes = (table: Table, entry: Entry) => {
  const returnTable: Table = { ...table };
  returnTable.rows["id"] = firstOrDefault(fhirpath.evaluate(entry.resource, `${entry.resource.resourceType}.id`));
  returnTable.rows["version"] = firstOrDefault(fhirpath.evaluate(entry.resource, `${entry.resource.resourceType}.meta.versionId`));
  returnTable.rows["last_updated"] = firstOrDefault(fhirpath.evaluate(entry.resource, `${entry.resource.resourceType}.meta.lastUpdated`));
  returnTable.rows["created_at"] = new Date().toISOString().split('T')[0];
  return returnTable;
};

export const GetTableMappings = (fhirMappings: FhirMapping[], entry: Entry, plugins: Map<string, FhirPlugin>): Table[] => {
  let tables: Table[] = [];

  const fhirMapping = fhirMappings.find((fm) => fm.resourceType === entry.resource.resourceType);

  fhirMapping?.tableMappings.forEach((tableMapping) => {
    let table = tables.find((t) => t.name === tableMapping.targetTable);
    if (!table) {
      table = {
        name: tableMapping.targetTable,
        rows: {},
      };
      tables.push(table);
      mapDefaultResourceAttributes(table, entry);
    }

    let matchFilter = tableMapping.filter ? firstOrDefault(fhirpath.evaluate(entry.resource, tableMapping.filter)) : true;
    if (matchFilter) {
      tableMapping.columnMappings.forEach((columnMapping) => {
        if (table) {
          // TODO: find out how we should handle multiple return values of the fhirpath evaluation
          table.rows[columnMapping.columnName] = firstOrDefault(fhirpath.evaluate(entry.resource, columnMapping.fhirPath));
        }
      });

      if (tableMapping.plugin) {
        try {
          const plugin = plugins.get(tableMapping.plugin);
          const pluginResult = plugin(table, entry, tableMapping);
          if (pluginResult && instanceOfTable(pluginResult)) {
            table = pluginResult;
          }
        } catch (error) {
          console.error(`An error occured while trying to process plugin ${tableMapping.plugin}`);
          console.error(error);
        }
      }
    }
  });

  tables = removeEmptyTableMappings(tables);

  return tables;
};
