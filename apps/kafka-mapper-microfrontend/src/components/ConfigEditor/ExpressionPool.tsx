import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { useFhirMapperConfig } from "../FhirMapperConfigProvider";
import { DraggableChip } from "./DraggableChip";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function ExpressionPool() {
  const { expressions } = useFhirMapperConfig();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "left",
        flexWrap: "wrap",
        listStyle: "none",
        p: "20px",
        m: 0,
        minHeight: "2rem",
        bgcolor: "#F1F1F1",
        borderRadius: 2,
        boxShadow: "inset 0px 0px 10px rgba(0, 0, 0, 0.2)",
      }}
      component="ul"
    >
      {expressions.map((expression) => {
        return (
          <ListItem key={expression.columnName}>
            <DraggableChip expression={expression} type="EXPRESSION" />
          </ListItem>
        );
      })}
    </Box>
  );
}
