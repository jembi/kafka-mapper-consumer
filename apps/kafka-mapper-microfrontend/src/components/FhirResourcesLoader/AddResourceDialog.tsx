import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export function AddResourceDialog(props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState({});

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleFileInputChange = (event) => {
    setFile(event.target.files[0]);
  };
  const handleLoadFile = (event) => {
    event.preventDefault();
    props.handleFormSubmit(file);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="text"
        onClick={handleClickOpen}
        startIcon={<UploadFileIcon />}
      >
        Add Resource(s)
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add FHIR Resource(s)</DialogTitle>
        <DialogContent>
          <form id="load-fhir-resource-form" onSubmit={handleLoadFile}>
            <TextField
              inputProps={{ accept: "application/json,text/plain,*/*" }}
              onChange={(e) => {
                handleFileInputChange(e);
              }}
              id="file"
              type="file"
              autoFocus
              margin="dense"
              variant="outlined"
              required
              fullWidth
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            form="load-fhir-resource-form"
            variant="contained"
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
