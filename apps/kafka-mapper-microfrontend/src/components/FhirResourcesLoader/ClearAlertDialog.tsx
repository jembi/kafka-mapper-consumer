import { Button, DialogContentText } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import { Delete } from "@mui/icons-material";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { useFhirMapperConfig } from "../FhirMapperConfigProvider";

export function ClearAlertDialog() {
  const [open, setOpen] = useState(false);
  const { clearConfig } = useFhirMapperConfig();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClear = () => {
    // clear the current loaded resources
    clearConfig();
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="text"
        onClick={handleClickOpen}
        startIcon={<ClearAllIcon />}
      >
        Clear
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Clear current loaded Resources ?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This will remove all loaded resources and reset this form. Click
            Cancel if you want to keep your current resources.
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
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
