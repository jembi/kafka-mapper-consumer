import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  CardActions,
  Typography,
  Stack,
} from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import ExpressionPool from "./ExpressionPool";
import { UpdateConfig } from "./UpdateConfig";
import { TablesContainer } from "./TablesContainer";
import { AddExpressionDialog } from "./AddExpressionDialog";
import {
  MappingSchemaItem,
  useFhirMapperConfig,
} from "../FhirMapperConfigProvider";

export function FhirMapperConfigEditor() {
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <Card>
          <CardHeader
            title="Config Editor"
            subheader="Use tables and custom expressions to configure your FHIR resources."
            action={<UpdateConfig />}
          />
          <Divider sx={{ height: 1, alignSelf: "stretch", my: 2 }}></Divider>
          <CardActions>
            <Divider></Divider>
            <AddExpressionDialog />
          </CardActions>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="body2">
                FHIR Path expressions Pool
              </Typography>
              <ExpressionPool />
              <TablesContainer />
            </Stack>
          </CardContent>
        </Card>
      </DndProvider>
    </>
  );
}
