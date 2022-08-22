import fhirpath from "fhirpath";
import { Entry, FhirMapping, Table } from "./types";

export const ValidateFhirMappingsJson = (fhirMappings: FhirMapping[]): Boolean => {
  console.log(fhirMappings);
  return true;
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
