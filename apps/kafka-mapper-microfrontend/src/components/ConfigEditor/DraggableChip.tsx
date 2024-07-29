import { FC, memo, useState } from "react";
import { useDrag } from "react-dnd";
import Chip from "@mui/material/Chip";
import { Avatar, Button } from "@mui/material";
import { Edit } from "@mui/icons-material";
import {
  ColumnMapping,
  useFhirMapperConfig,
} from "../FhirMapperConfigProvider";
import { EditExpressionDialog } from "./EditExpressionDialog";

export interface DraggableChipProps {
  expression: ColumnMapping;
  type: string;
  table?: string;
}

export const DraggableChip: FC<DraggableChipProps> = memo(
  function DraggableChip({ expression, type, table }) {
    const [{ opacity }, drag] = useDrag(
      () => ({
        type: "EXPRESSION",
        item: expression,
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging(),
          opacity: monitor.isDragging() ? 0.4 : 1,
        }),
      }),
      [name, type]
    );

    const { removeExpression, removeMappingSchemaItem } = useFhirMapperConfig();

    return (
      <div ref={drag} style={{ opacity }}>
        <Chip
          avatar={
            <Avatar>
              <EditExpressionDialog
                table={table}
                prevColumnName={expression.columnName}
                prevExpression={expression.fhirPath}
              />
            </Avatar>
          }
          label={expression.columnName}
          color={"primary"}
          onDelete={() => {
            if (table) {
              removeMappingSchemaItem(table, expression);
              removeExpression("");
            } else {
              removeExpression(expression.columnName);
            }
          }}
          clickable
        />
      </div>
    );
  }
);
