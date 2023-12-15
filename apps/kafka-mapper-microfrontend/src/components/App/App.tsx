import { Typography, Grid, Paper, Divider } from "@mui/material";
import { StylingValue } from "react-json-tree";
import { FhirResourcesLoader } from "../RessourcesLoader/FhirResourcesLoader";
import { FhirMapperConfigEditor } from "../ConfigEditor/ConfigEditor";

export const getLabelStyle: StylingValue = ({ style }, nodeType) => ({
  style: {
    ...style,
    fontFamily: "Roboto",
    "San Francisco": style.fontFamily,
  },
});
export function Workspace(props) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FhirResourcesLoader />
      </Grid>
      <Grid item xs={12} md={6}>
        <FhirMapperConfigEditor />
      </Grid>
    </Grid>
  );
}

export default function App(props) {
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
          <Workspace />
        </section>
      </Paper>
    </>
  );
}
