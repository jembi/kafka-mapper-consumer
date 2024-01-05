import { ListItem } from "@mui/material";
import {
  ColumnMapping,
} from "../FhirMapperConfigProvider";
import { DraggableChip } from "./DragabbleChip";

export interface TablesContainerProps {
  expression: ColumnMapping;
}

export function ExpressionsDropTable({ expression }: TablesContainerProps) {
  return (
    <ListItem>
      <DraggableChip expression={expression} type="EXPRESSION" />
    </ListItem>
  );
}
