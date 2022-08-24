import { Kafka, logLevel } from "kafkajs";
import { Entry, FhirMapping, Table } from "./types";
import { GetTableMappings, ValidateFhirMappingsJson } from "./util";
import { loadDataIntoClickhouse } from "./clickhouse/utils";

const fhirMappings: FhirMapping[] = require("./data/fhir-mapping.json");
const fhirMappingValidationErrors = ValidateFhirMappingsJson(fhirMappings);
if (fhirMappingValidationErrors.length > 0) {
  console.error("Invalid fhir-mapping.json file");
  fhirMappingValidationErrors.forEach((error) => console.error(error));
  process.exit(1);
}

// TODO: find out if http is required for local testing
const kafkaHost = process.env.KAFKA_HOST || "http://localhost";
const kafkaPort = process.env.KAFKA_PORT || "9092";

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`${kafkaHost}:${kafkaPort}`],
  clientId: "kafka-mapper-consumer",
});

const consumer = kafka.consumer({ groupId: "kafka-mapper-consumer" });
const producer = kafka.producer();

const run = async () => {
  const topics = fhirMappings.map((fhirMapping) => fhirMapping.resourceType.toLowerCase());

  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topics, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);

      const entry: Entry = JSON.parse(message.value?.toString() ?? "");

      const tableMappings: Table[] = GetTableMappings(fhirMappings, entry);

      const clickhousePromises = tableMappings.map((tableMapping) => loadDataIntoClickhouse(tableMapping));
      Promise.allSettled(clickhousePromises)
        .then((results) => results.forEach((result) => console.log(result)))
        .catch((error) => console.error(error));
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
      await producer.disconnect();
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
      await producer.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
