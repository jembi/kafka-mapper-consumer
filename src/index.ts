import { Kafka, logLevel } from "kafkajs";
import fhirpath from "fhirpath";
import { Entry, FhirMapping, LooseObject } from "./types";
import { loadDataIntoClickHouse, createClickhouseTables } from "./clickhouse/utils";

const kafkaHost = process.env.KAFKA_HOST || "localhost";
const kafkaPort = process.env.KAFKA_PORT || "9092";

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`${kafkaHost}:${kafkaPort}`],
  clientId: "kafka-mapper-consumer",
});

const consumer = kafka.consumer({ groupId: "kafka-mapper-consumer" });
const producer = kafka.producer();

const run = async () => {
  const fhirMappings: FhirMapping[] = require("./data/fhir-mapping.json");
  const topics = fhirMappings.map((fhirMapping) => fhirMapping.resourceType.toLowerCase());

  createClickhouseTables()

  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topics, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);

      const entry: Entry = JSON.parse(message.value?.toString() ?? "");

      const fhirMapping = fhirMappings.find((fm) => fm.resourceType === entry.resource.resourceType);
      fhirMapping?.tableMappings.forEach((tableMapping) => {
        const row: LooseObject = {}; //Set once we know what the required data structure is for inserting into clickhouse

        let matchFilter = tableMapping.filter ? fhirpath.evaluate(entry.resource, tableMapping.filter) : false
        if(matchFilter){
            tableMapping.columnMappings.forEach((columnMapping) => {
                row[columnMapping.columnName] = fhirpath.evaluate(entry.resource, columnMapping.fhirPath);
                loadDataIntoClickHouse(topic, row)
            });
        }
      });
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
