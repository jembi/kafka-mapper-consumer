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

  function isValidBundle(objectToTest: any): boolean {
    try {
      // Attempt to cast the object to the Bundle type
      const bundle = objectToTest as Bundle;

      // Check for required properties and types
      if (
        !bundle.resourceType ||
        bundle.resourceType !== "Bundle" ||
        // According to the FHIR specification, the id property within a FHIR Bundle is not strictly mandatory for the Bundle to be considered valid.
        // However, it's highly recommended to include it.
        // !bundle.id ||
        !bundle.type ||
        !Array.isArray(bundle.entry)
      ) {
        return false;
      }

      // Perform additional validation checks as needed,
      // e.g., checking entry types or specific resource constraints

      return true;
    } catch (error) {
      // Handle casting errors, indicating invalid Bundle structure
      return false;
    }
  }

  function isValidResource(objectToTest: any): boolean {
    try {
      // Attempt to cast the object to the FhirResource type
      const resource = objectToTest as FhirResource;

      // Check for required properties and types
      if (
        !resource.resourceType ||
        resource.resourceType == "Bundle"
        //!resource.id
        //!resource.meta ||
        //!resource.meta.versionId
      ) {
        return false;
      }

      // Perform additional validation checks as needed,
      // e.g., checking specific resource constraints

      return true;
    } catch (error) {
      // Handle casting errors, indicating invalid FHIR Resource structure
      return false;
    }
  }

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
      try {
        const parsedData = await readJsonFile(file);
        if (isValidBundle(parsedData)) {
          const fhirBundle = parsedData as Bundle<FhirResource>;
          setFhirBundle(fhirBundle);
        } else if (isValidResource(parsedData)) {
          const resource = parsedData as FhirResource;
          const fhirBundle = {
            resourceType: "Bundle",
            type: "collection",
            entry: [
              {
                resource: resource,
              },
            ],
          } as Bundle<FhirResource>;
          console.log("FHIR Resource converted to Bundle: ", fhirBundle);
          setFhirBundle(fhirBundle as Bundle<FhirResource>);
        } else {
          console.log("Invalid FHIR Resource or Bundle");
          window.alert("Invalid FHIR Resource or Bundle");
        }
      } catch (error) {
        console.error("An error occurred while processing the file:", error);
        window.alert("An error occurred while processing the file.");
      }
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
