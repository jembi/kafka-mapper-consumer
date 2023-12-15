import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
} from "@mui/material";
import { JSONViewer } from "./JSONViewer";

export function FhirResourcesLoader(props) {
  return (
    <>
      <Card>
        <CardHeader
          title="FHIR Resources Loader"
          subheader="Upload a FHIR Bundle to start mapping your resources."
          action={<Button variant="text">Clear</Button>}
        />
        <CardContent>
          <Divider sx={{ height: 1, alignSelf: "stretch", my: 2 }}></Divider>
          <JSONViewer />
        </CardContent>
        <CardActions>
          <Button variant="text">Add Resource(s)</Button>
        </CardActions>
      </Card>
    </>
  );
}
