jq -rc . ./test/data/mapping/happy-flow/entry.json | docker exec -i kafka-mapper-consumer-monorepo-kafka-1 kafka-console-producer.sh --bootstrap-server localhost:9092 --topic patient -
