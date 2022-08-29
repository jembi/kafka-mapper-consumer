import { Entry } from "./bundle";
import { TableMapping } from "./fhirMapping";
import { Table } from "./tableMapping";

type FhirPlugin = (tableMapping: TableMapping, entry: Entry, table: Table) => Table;

export interface PluginScript {
  plugin: FhirPlugin;
}
