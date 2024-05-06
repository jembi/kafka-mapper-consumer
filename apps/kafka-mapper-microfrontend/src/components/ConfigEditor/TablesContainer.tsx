import { nanoid } from "nanoid";
import { useFhirMapperConfig } from "../FhirMapperConfigProvider";
import { AddTableDialog } from "./AddTableDialog";
import { Table } from "./Table";

export function TablesContainer() {
  const { tables } = useFhirMapperConfig();
  return (
    <div id="tables-container">
      <AddTableDialog />
      {tables.map((table) => (
        <Table key={nanoid()} table={table} />
      ))}
    </div>
  );
}
