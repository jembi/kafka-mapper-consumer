import { Box, Card, CardHeader, IconButton, Typography } from "@mui/material";
import { useDrop } from "react-dnd";
import {
  ColumnMapping,
  useFhirMapperConfig,
} from "../FhirMapperConfigProvider";
import { ExpressionsDropTable } from "./ExpressionsDropTable";
import { DeleteTableDialog } from "./DeleteTableDialog";
import { nanoid } from "nanoid";

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
      return "#5cb85c";
    } else if (canDrop) {
      return "#F5F5F5";
    } else {
      return "inherit";
    }
  };

  const backgroundColor = selectBackgroundColor(isActive, canDrop);

  const expressions = getMappingsByTable(table);

  return (
    <Card key={table} elevation={0}>
      <CardHeader
        title={<Typography variant="subtitle2">{table}</Typography>}
        action={<DeleteTableDialog table={table} />}
      ></CardHeader>

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
        {isOver && (
          <Typography align="center" variant="body2">
            Release to drop
          </Typography>
        )}
        {expressions.map((item) => {
          return (
            <ExpressionsDropTable
              key={nanoid()}
              expression={item}
              table={table}
            />
          );
        })}
      </Box>
    </Card>
  );
}
