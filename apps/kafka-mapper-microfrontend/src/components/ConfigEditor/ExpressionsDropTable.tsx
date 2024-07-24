import { ListItem } from "@mui/material";
import { ColumnMapping } from "../FhirMapperConfigProvider";
import { DraggableChip } from "./DraggableChip";

export interface ExpressionsDropTableProps {
  expression: ColumnMapping;
  table: any;
}

export function ExpressionsDropTable({
  expression,
  table,
}: ExpressionsDropTableProps) {
  return (
    <ListItem key={expression.columnName + table}>
      <DraggableChip expression={expression} table={table} type="EXPRESSION" />
    </ListItem>
  );
}
