import { Entry } from "./bundle";
import { TableMapping } from "./fhirMapping";
import { Table } from "./tableMapping";

export type FhirPlugin = (table: Table, entry: Entry, tableMapping: TableMapping) => Table;

export interface PluginScript {
  plugin: FhirPlugin;
}
