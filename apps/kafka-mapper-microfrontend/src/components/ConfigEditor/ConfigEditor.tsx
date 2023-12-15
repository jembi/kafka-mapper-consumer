import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  CardActions,
  Button,
} from "@mui/material";

export function FhirMapperConfigEditor(props) {
  return (
    <>
      <Card>
        <CardHeader
          title="Config Editor"
          subheader="Use tables and custom expressions to configure your FHIR resources."
        />
        <CardContent>
          <Divider sx={{ height: 1, alignSelf: "stretch", my: 2 }}></Divider>
        </CardContent>
        <CardActions>
          <Divider></Divider>
          <Button variant="text" aria-label="FHIRPath Expression" disabled>
            Add Expression
          </Button>
          <Button variant="text" aria-label="Table" disabled>
            Add Table
          </Button>
        </CardActions>
      </Card>
    </>
  );
}
