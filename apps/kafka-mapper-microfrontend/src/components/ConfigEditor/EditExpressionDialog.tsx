import { useEffect, useState } from "react";
import {
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Link,
} from "@mui/material";
import fhirpath from "fhirpath";
import { useFhirMapperConfig } from "../FhirMapperConfigProvider";
import { FhirResource } from "fhir/r4";
import { Edit } from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

export function EditExpressionDialog({
  table,
  prevExpression,
  prevColumnName,
}) {
  const [open, setOpen] = useState(false);
  const [previewValue, setPreviewValue] = useState("");
  const [expression, setExpression] = useState(prevExpression);
  const [columnName, setColumnName] = useState(prevColumnName);
  const { activeFhirResource, updateMappingSchemaItem } = useFhirMapperConfig();

  const handleClickOpen = () => {
    const resourceType = expression.split(".")[0];
    if (resourceType !== activeFhirResource.resourceType) {
      handleClose();
      alert("Invalid FHIRPath expression. Please try again.");
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPreviewValue("");
  };

  const handleAddElement = (event) => {
    event.preventDefault();
    const resourceType = expression.split(".")[0];
    updateMappingSchemaItem(
      table,
      prevColumnName,
      { columnName: columnName, fhirPath: expression },
      resourceType
    );
    handleClose();
  };

  function renderPreview() {
    // evaluate FHIRPath expression on FHIR resource and return result
    // TODO : add handle errors
    try {
      return fhirpath.evaluate(activeFhirResource, expression);
    } catch {
      return "Error! Invalid expression.";
    }
  }

  useEffect(() => {
    // Assuming renderPreview uses the expression state internally
    const preview = renderPreview();
    if (typeof preview === "string" && preview.startsWith("Error")) {
      setPreviewValue("Error! Invalid expression.");
    } else {
      setPreviewValue(preview.toString());
    }
  }, [expression]);

  return (
    <>
      <Button
        variant="text"
        aria-label="FHIRPath Expression"
        onClick={handleClickOpen}
        disabled={!table}
        sx={{
          backgroundColor: "white",
          opacity: 0.6,
          visibility: table ? "visible" : "hidden",
        }}
      >
        <EditOutlinedIcon fontSize="small" color="action" />
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="add-expression-alert-dialog">
          {"Add Custom Expression"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} p={"10px"}>
            <form id="add-expression" onSubmit={handleAddElement}>
              <TextField
                onChange={(e) => setColumnName(e.target.value)}
                inputProps={{ pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$" }}
                id="column-name-input"
                name="column-name-input"
                label="Name of the output column"
                variant="outlined"
                type="text"
                fullWidth
                required
                helperText="This is the name of the column that will be created in the table. Only alphanumeric characters and underscores allowed"
                value={columnName}
              />
              <TextField
                id="expression-input"
                name="expression-input"
                label="Expression"
                variant="outlined"
                type="text"
                onChange={(e) => {
                  setExpression(e.target.value);
                }}
                fullWidth
                required
                helperText={[
                  "This is the FHIRPath expression that will be used to extract the value from the FHIR resource. Read about FHIRPath expressions here: ",
                  <Link
                    key="FHIRpath-helperText-link"
                    href="https://www.hl7.org/fhirpath/"
                    target="_blank"
                  >
                    {"https://www.hl7.org/fhirpath/"}
                  </Link>,
                ]}
                value={expression}
              />
            </form>
            <TextField
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#111111",
                },
              }}
              disabled
              multiline
              minRows={3}
              id="expression-output-preview"
              name="expression-output-preview"
              label="Result preview"
              variant="standard"
              type="text"
              helperText="This is a preview of the result of the expression. It will be used as a column value."
              fullWidth
              error={previewValue === "Error! Invalid expression."}
              inputProps={{ readOnly: true }}
              value={previewValue}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            color={"primary"}
            variant={"contained"}
            type="submit"
            form="add-expression"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
