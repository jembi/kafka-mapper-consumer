# kafka-mapper-consumer
This is the base package for the kafka mapper used in the jembi platform

This project uses `yarn 1.22.17`

## Install dependencies

Run `yarn`

## Start locally

Run `yarn start`

## Tests

Run `yarn test`

## Build docker image

Docker image: `jembi/kafka-mapper-consumer`

Run `yarn build`

## FHIR Mapping

### Schema

The schema may be found in /schema/fhir-mapping.schema.json or [here](https://raw.githubusercontent.com/jembi/kafka-mapper-consumer/main/schema/fhir-mapping.schema.json?token=GHSAT0AAAAAABRAWUNTASOLWTLE2SXGJCDQYYGGSTA)

This mapper currently only supports a single fhir mapping json file to load from and should be located and named as such in `/src/data/fhir-mapping.json`

Should you wish to override this file in the docker built image it should be overwritten at `/app/src/data/fhir-mapping.json`

### Fhir Path

[Docs](https://www.hl7.org/fhir/fhirpath.html)

Column mappings should always conform to the fhir path spec defined in the Docs

### Filter

The filter attribute should be a fhir path literal that resolves to a boolean (eg. "Patient.name.given = 'Buck'")

### Plugin

Plugins are located in the `/src/plugin/` directory.

Should you wish to include plugins in the docker built image these files should be included at `/app/src/plugin/`

The plugin script provided should export a function that conforms to the following spec:
```typescript
type FhirPlugin = (tableMapping: TableMapping, entry: Entry, table: Table) => Table;

export interface PluginScript {
  plugin: FhirPlugin;
}
```

Further type definitions may be found at `/src/types/`

Example:
```typescript
export const plugin = (tableMapping, entry, table) => {
  if (table.rows.patientGivenName && table.rows.patientFamilyName) {
    table.rows["patientFullName"] = `${table.rows.patientGivenName} ${table.rows.patientFamilyName}`;
  }
  return table;
};
```
