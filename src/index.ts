import { Kafka, logLevel } from "kafkajs";

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
  const topics = ["resource"];
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topics, fromBeginning: true });
  //TODO: TO BE IMPLEMENTED
  //await consumer.run();
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
