import Ajv from "ajv";
import fhirpath from "fhirpath";
import { Entry, FhirMapping, Table } from "./types";

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

    tableMapping.columnMappings.forEach((columnMapping) => {
      if (table) {
        table.rows[columnMapping.columnName] = fhirpath.evaluate(entry.resource, columnMapping.fhirPath);
      }
    });
  });

  return tables;
};
