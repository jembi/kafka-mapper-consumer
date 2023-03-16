import { Kafka, logLevel } from "kafkajs";
import { registerMediator, activateHeartbeat, fetchConfig } from "openhim-mediator-utils"
import { promisify } from "util"
import { Entry, FhirMapping, FhirPlugin, Table } from "./types";
import { GetFhirPlugins, GetTableMappings, ValidateFhirMappingsJson } from "./util";
import { loadDataIntoClickhouse, selectByIdClickhouse, alterRowIntoClickhouse } from "./clickhouse/utils";
import mediatorConfig from "./data/mediator-config.json"

let fhirMappings: FhirMapping[] = require("./data/fhir-mapping.json");
// Set default mediator FHIR mapping from config file
mediatorConfig.config.fhirMappings = JSON.stringify(fhirMappings, null, 2)

const plugins: Map<string, FhirPlugin> = GetFhirPlugins(fhirMappings);

const kafkaHost = process.env.KAFKA_HOST ?? "localhost";
const kafkaPort = process.env.KAFKA_PORT ?? "9092";
const trustSelfSigned = (process.env.TRUST_SELF_SIGNED ?? "false") === "true"
const openhimAuth = {
  apiURL: process.env.OPENHIM_API_URL ?? "https://localhost:8080",
  username: process.env.OPENHIM_USERNAME ?? "root@openhim.org",
  password: process.env.OPENHIM_PASSWORD ?? "password",
  trustSelfSigned,
  urn: "urn:openhim-mediator:kafka-mapper-consumer"
}
const shouldRegisterMediator = (process.env.REGISTER_MEDIATOR ?? "false") === "true"
const fromBeginning = (process.env.KAFKA_FROM_BEGINNING ?? "true") === "true"
const consumerGroupId = process.env.CONSUMER_GROUP_ID ?? "kafka-mapper-consumer"

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`${kafkaHost}:${kafkaPort}`],
  clientId: "kafka-mapper-consumer",
});

let consumer = kafka.consumer({ groupId: "kafka-mapper-consumer" });

const run = async (newFhirMappings?) => {
  if (newFhirMappings) {
    await consumer.disconnect();
    // create new consumer so we can subscribe to a (potentially) different set of topics
    consumer = kafka.consumer({ groupId: consumerGroupId });
    fhirMappings = newFhirMappings;
  }

  // Register as an OpenHIM mediator and use that for config management
  if (shouldRegisterMediator && !newFhirMappings) {
    console.log("Registering as an OpenHIM Mediator. The OpenHIM will be used to supply latest config not the config file, the config file will provide the default config to the OpenHIM.")
    await promisify(registerMediator)(openhimAuth, mediatorConfig);
    const configEmitter = activateHeartbeat(openhimAuth);

    configEmitter.on('config', (config) => {
      console.log('Received new mapping config, restarting consumer...')
      // restart consumer with new config
      run(JSON.parse(config.fhirMappings))
    })

    const config = await promisify(fetchConfig)(openhimAuth)
    // set config to that received from the OpenHIM
    fhirMappings = JSON.parse(config.fhirMappings)
  }

  const fhirMappingValidationErrors = ValidateFhirMappingsJson(fhirMappings);
  if (fhirMappingValidationErrors.length > 0) {
    console.error("Invalid fhir-mapping.json file");
    fhirMappingValidationErrors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const topics = fhirMappings.map((fhirMapping) => fhirMapping.resourceType.toLowerCase());

  await consumer.connect();
  await consumer.subscribe({ topics, fromBeginning });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);

      const entry: Entry = JSON.parse(message.value?.toString() ?? "");

      const tableMappings: Table[] = GetTableMappings(fhirMappings, entry, plugins);

      for (const tableMapping of tableMappings) {
        const res = await selectByIdClickhouse(tableMapping);
        if (res.length == 0) {
          loadDataIntoClickhouse(tableMapping)
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
        } else {
          alterRowIntoClickhouse(tableMapping)
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
        }
      }
    },
  });
};

run().catch((e: Error) => console.error(`[kafka-mapper-consumer] ${e.message}`, e));

const errorTypes = ["unhandledRejection", "uncaughtException"];
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

errorTypes.forEach((type) => {
  process.on(type, async (e: Error) => {
    try {
      console.log(`process.on ${type}`);
      console.error(e);
      await consumer.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.forEach((type) => {
  process.once(type, async () => {
    try {
      await consumer.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
