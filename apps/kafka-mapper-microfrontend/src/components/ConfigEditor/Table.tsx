import { Box, Typography } from "@mui/material";
import { useDrop } from "react-dnd";
import {
  ColumnMapping,
  useFhirMapperConfig,
} from "../FhirMapperConfigProvider";
import { ExpressionsDropTable } from "./ExpressionsDropTable";

export function Table({ table }: { table: string }) {
  const { getMappingsByTable, addMappingSchemaItem } = useFhirMapperConfig();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "EXPRESSION",
    drop: (expression: ColumnMapping) => {
      addMappingSchemaItem(table, expression);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const isActive = canDrop && isOver;

  const selectBackgroundColor = (isActive: boolean, canDrop: boolean) => {
    if (isActive) {
      return "lightgreen";
    } else if (canDrop) {
      return "lightgray";
    } else {
      return "inherit";
    }
  };

  const backgroundColor = selectBackgroundColor(isActive, canDrop);

  const expressions = getMappingsByTable(table);

  return (
    <Box key={table}>
      <Typography variant="subtitle2" p={1}>
        {table}
      </Typography>
      <Box
        ref={drop}
        sx={{
          borderRadius: "8px",
          boxShadow: "0",
          borderStyle: "dashed",
          borderWidth: "1px",
          borderColor: "#1976D2",
          minHeight: "3rem",
          backgroundColor: backgroundColor,
        }}
      >
        {isOver ? (
          <Typography align="center" variant="inherit">
            Release to drop
          </Typography>
        ) : (
          <Typography align="center" variant="inherit">
            You can Drag an expression(s) here
          </Typography>
        )}
        {expressions.map((item) => {
          return (
            <ExpressionsDropTable
              key={item.columnName + "-" + table}
              expression={item}
            />
          );
        })}
      </Box>
    </Box>
  );
}
