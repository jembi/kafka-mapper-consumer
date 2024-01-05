import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";
import { useFhirMapperConfig } from "../FhirMapperConfigProvider";
import { FhirResource } from "fhir/r4";

// File selector Menu
export function FhirFileSelector() {
  const { activeFhirResource, setActiveFhirResource, fhirBundle } =
    useFhirMapperConfig();

  const handleChange = (event: SelectChangeEvent) => {
    const id = event.target.value;
    const resource = fhirBundle?.entry?.find(
      (item) => item.resource.id === id
    )?.resource;
    setActiveFhirResource(resource);
  };

  const entries = fhirBundle?.entry || [];
  return (
    <>
      <FormControl fullWidth sx={{ py: 1 }}>
        <InputLabel id="fhir-resource-selector-menu-label">
          Active FHIR Resource
        </InputLabel>
        <Select
          variant="outlined"
          labelId="fhir-resource-selector-menu-label"
          id="fhir-resource-selector-menu"
          value={(activeFhirResource && activeFhirResource.id) || ""}
          label="Active FHIR Resource"
          onChange={handleChange}
        >
          <MenuItem key={"empty-menu-item"} value={""}>
            <em>None</em>
          </MenuItem>
          {entries.length > 0 &&
            entries.map((item) => (
              <MenuItem key={item.fullUrl} value={item.resource.id}>
                {item.resource.resourceType + " - " + item.resource.id}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </>
  );
}
