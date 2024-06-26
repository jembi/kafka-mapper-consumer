import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useFhirMapperConfig } from "../FhirMapperConfigProvider";

export function AddTableDialog() {
  const [open, setOpen] = useState(false);
  const { addTable } = useFhirMapperConfig();
  const [tableName, setTableName] = useState("");
  const [error, setError] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddTable = (event) => {
    event.preventDefault();
    try {
      addTable(tableName);
    } catch (e) {
      alert(e.message);
      setError(true);
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <Button variant="text" onClick={handleClickOpen}>
        Add Table
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="add-table-alert-dialog">{"Add Table"}</DialogTitle>
        <DialogContent>
          <form
            style={{ paddingTop: "10px" }}
            onSubmit={handleAddTable}
            id="add-table-form"
            autoComplete="off"
          >
            <TextField
              inputProps={{ pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$" }}
              id="table-name-input"
              name="table-name-input"
              label="Table Name"
              variant="outlined"
              type="text"
              fullWidth
              required
              onChange={(e) => setTableName(e.target.value)}
              helperText="Table name must be unique, start with a letter or underscore and contain only letters, numbers, and underscores."
              error={error}
            ></TextField>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button color={"primary"} type="submit" form="add-table-form">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
