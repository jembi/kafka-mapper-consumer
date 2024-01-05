import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
} from "@mui/material";
import { FhirResource } from "fhir/r4";
import { JSONViewer } from "./JSONViewer";
import { ClearAlertDialog } from "./ClearAlertDialog";
import { FhirFileSelector } from "./FhirFileSelector";
import { AddResourceDialog } from "./AddResourceDialog";
import { useFhirMapperConfig } from "../FhirMapperConfigProvider";
import { Bundle } from "fhir/r4";

export function FhirResourcesLoader() {
  const { activeFhirResource, setFhirBundle } = useFhirMapperConfig();
  const readJsonFile = (file: Blob) =>
    new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        if (event.target) {
          resolve(JSON.parse(event.target.result as string));
        }
      };

      fileReader.onerror = (error) => reject(error);
      fileReader.readAsText(file);
    });

  const handleFormSubmit = async (file) => {
    if (file) {
      const parsedData = await readJsonFile(file);
      const bundle = parsedData as Bundle<FhirResource>;
      setFhirBundle(bundle);
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="FHIR Resources Loader"
          subheader="Upload a FHIR Bundle to start mapping your resources."
          action={<ClearAlertDialog />}
        />
        <Divider sx={{ height: 1, alignSelf: "stretch", my: 2 }}></Divider>
        <CardActions>
          <AddResourceDialog handleFormSubmit={handleFormSubmit} />
        </CardActions>
        <CardContent>
          <FhirFileSelector />
          <JSONViewer data={activeFhirResource} />
        </CardContent>
      </Card>
    </>
  );
}
