import Ajv from "ajv";
import fhirpath from "fhirpath";
import { Entry, FhirMapping, Table } from "./types";
import { PluginScript } from "./types/plugin";

const ajv = new Ajv({ allErrors: true, strictTuples: false });
const schema = require("../schema/fhir-mapping.schema.json");
delete schema["$schema"];
const validate = ajv.compile(schema);

const hasUniqueResourceTypes = (fhirMappings: FhirMapping[]) => {
  const resourceTypes = fhirMappings.map((fhirMapping) => fhirMapping.resourceType);
  const uniqueResourceTypes = [...new Set(resourceTypes)];
  const hasUniqueResourceTypes = uniqueResourceTypes.length === fhirMappings.length;
  return hasUniqueResourceTypes;
};

export const ValidateFhirMappingsJson = (fhirMappings: FhirMapping[]): Error[] => {
  let errors: Error[] = [];

  if (!hasUniqueResourceTypes(fhirMappings)) errors.push(new Error("Duplicate resource type "));

  if (!validate(fhirMappings)) {
    errors = [...errors, ...(validate.errors?.map((error) => new Error(error.message)) ?? [])];
  }

  return errors;
};

export const GetTableMappings = (fhirMappings: FhirMapping[], entry: Entry): Table[] => {
  const tables: Table[] = [];

  const fhirMapping = fhirMappings.find((fm) => fm.resourceType === entry.resource.resourceType);

  fhirMapping?.tableMappings.forEach((tableMapping) => {
    let table = tables.find((t) => t.name === tableMapping.targetTable);
    if (!table) {
      table = {
        name: tableMapping.targetTable,
        rows: {},
      };
      tables.push(table);
    }

    let matchFilter = tableMapping.filter ? fhirpath.evaluate(entry.resource, tableMapping.filter)[0] : true;
    if (matchFilter) {
      tableMapping.columnMappings.forEach((columnMapping) => {
        if (table) {
          // TODO: find out how we should handle multiple return values of the fhirpath evaluation
          table.rows[columnMapping.columnName] = fhirpath.evaluate(entry.resource, columnMapping.fhirPath)[0];
        }
      });

      if (tableMapping.plugin) {
        try {
          const pluginScript: PluginScript = require(`./plugin/${tableMapping.plugin}`);
          table = pluginScript.plugin(tableMapping, entry, table);
        } catch (error) {
          console.error(`An error occured while trying to process plugin ${tableMapping.plugin}`);
          console.error(error);
        }
      }
    }
  });

  return tables;
};
