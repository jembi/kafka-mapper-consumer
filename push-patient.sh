jq -rc . ./test/data/mapping/happy-flow/entry.json | docker exec -i kafka-mapper-consumer_kafka_1 kafka-console-producer.sh --bootstrap-server localhost:9092 --topic patient -
