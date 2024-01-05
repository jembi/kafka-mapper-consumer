import { useFhirMapperConfig } from "../FhirMapperConfigProvider";
import { AddTableDialog } from "./AddTableDialog";
import { Table } from "./Table";

export function TablesContainer() {
  const { tables } = useFhirMapperConfig();
  return (
    <div id="tables-container">
      <AddTableDialog />
      {tables.map((table) => (
        <Table key={table} table={table} />
      ))}
    </div>
  );
}
