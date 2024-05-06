import { Button, DialogContentText, IconButton } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import { Delete } from "@mui/icons-material";
import { useFhirMapperConfig } from "../FhirMapperConfigProvider";

export function DeleteTableDialog({ table }) {
  const [open, setOpen] = useState(false);
  const { removeTable } = useFhirMapperConfig();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClear = () => {
    // clear the current loaded resources
    removeTable(table);
    setOpen(false);
  };

  return (
    <>
      <IconButton aria-label="delete-table" onClick={handleClickOpen}>
        <Delete fontSize="small" />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="delete-table-dialog-title"
        aria-describedby="delete-table-dialog-description"
      >
        <DialogTitle id="delete-table-dialog-title">
          Are you sure your want to remove this table?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-table-dialog-description">
            removing this table will remove the table from FHIR Mapping Config
            and all expressions associated with it. click Cancel if you want to
            keep your current table. click remove to remove the table.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color={"info"} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color={"error"}
            onClick={handleClear}
            startIcon={<Delete />}
            autoFocus
          >
            remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
