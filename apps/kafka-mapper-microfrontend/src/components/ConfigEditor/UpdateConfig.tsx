import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import { useFhirMapperConfig } from "../FhirMapperConfigProvider";
import { useState } from "react";
import { JSONTree } from "react-json-tree";

export function UpdateConfig() {
  const [open, setOpen] = useState(false);
  const { mappingSchema, updateConfigOnServer } = useFhirMapperConfig();

  const handleOpenReviewDialog = () => {
    setOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setOpen(false);
  };

  const handleUpdateConfig = () => {
    setOpen(false);
    updateConfigOnServer();
  };

  return (
    <>
      <Button
        variant="text"
        aria-label="Update Config"
        endIcon={<PublishIcon />}
        onClick={() => {
          handleOpenReviewDialog();
        }}
      >
        Update Config
      </Button>
      <Dialog
        open={open}
        onClose={handleCloseReviewDialog}
        aria-labelledby="publish-alert-dialog-title"
        aria-describedby="publish-alert-dialog-description"
      >
        <DialogTitle id="publish-alert-dialog-title">
          {"Review and publish FHIR Mapping Config"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="publish-alert-dialog-description">
            Please carefully review the FHIR Mapping Config below before
            publishing it. This action will overwrite any existent FHIR Mapping.
            <strong> Are you sure you want to proceed?</strong>
          </DialogContentText>
          <JSONTree collectionLimit={10} data={mappingSchema} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateConfig}
            startIcon={<PublishIcon />}
            autoFocus
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
