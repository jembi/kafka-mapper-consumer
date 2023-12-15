# kafka-mapper-consumer

This is the base package for the Kafka Mapper used in the Jembi platform.

## Prerequisites

- `node 16.17.0` 
- `yarn 1.22.17`

## Installation

To install the dependencies, run the following command:

### Install dependencies

Run `yarn`

### Start locally

Run `yarn start`

### Launch dev dependencies

To test locally you will need a few dependencies: Kafka, Clickhouse and OpenHIM. Use the following command to setup those in a dev environment.

```bash
docker-compose -f docker-compose.deps.yml up
# Visit the openHIM console to set a root password: http://localhost:9090
./scripts/create-test-tables.sh
./scripts/push-patient.sh
./scripts/list-patients.sh
# Now, launch the application `yarn start` or by use the vscode debugger and it will process the queue
```

Dep UIs:

* View the OpenHIM medaitor section: <http://localhost:9090/#!/mediators>
* Clickhouse play: <http://localhost:8124/play>

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
type FhirPlugin = (table: Table, entry: Entry, tableMapping: TableMapping) => Table;

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
