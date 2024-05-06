import { useEffect } from "react";
import { Typography, Grid, Paper, Divider } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FhirResourcesLoader } from "../FhirResourcesLoader/FhirResourcesLoader";
import { FhirMapperConfigEditor } from "../ConfigEditor/ConfigEditor";
import {
  FhirMapperConfigProvider,
  useFhirMapperConfig,
} from "../FhirMapperConfigProvider";

export function Workspace() {
  const { activeFhirResource } = useFhirMapperConfig();
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FhirResourcesLoader />
      </Grid>
      <Grid item xs={12} md={6}>
        {activeFhirResource && <FhirMapperConfigEditor />}
      </Grid>
    </Grid>
  );
}

export default function App(props) {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      // Custom logic to handle the refresh
      // Display a confirmation message or perform necessary actions
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  return (
    <>
      <Paper
        sx={{ p: 4, m: 5, minWidth: 380, backgroundColor: "#F5F5F5" }}
        elevation={0}
      >
        <section id="fhir-mapper-title">
          <Typography variant="h4">FHIR Mapper</Typography>
          <Typography variant="subtitle1">
            This app allows you to map your FHIR resources to ClickHouse using
            drag and drop editor.
          </Typography>
          <Divider sx={{ my: 2 }} />
        </section>
        <section id="fhir-mapper-workspace">
          <DndProvider backend={HTML5Backend}>
            <FhirMapperConfigProvider>
              <Workspace />
            </FhirMapperConfigProvider>
          </DndProvider>
        </section>
      </Paper>
    </>
  );
}
