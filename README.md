# Kafka-Mapper

This repository contains the Kafka-Mapper mono repo project. It includes a Kafka consumer application for mapping FHIR Resources to ClickHouse and a microfrontend for configuring kafka-mapper-consumer from OpenHIM Console.

## Structure

The repository is organized into the following main directories:

- `apps`: This directory contains the applications in the monorepo.

  - `kafka-mapper-consumer`: This is a Kafka consumer application. It includes a Dockerfile for building a Docker image of the application, a JSON schema for FHIR mapping, and TypeScript source code.

  - `kafka-mapper-microfrontend`: This is a microfrontend for the FHIR-Mapper-UI project.

- `scripts`: This directory contains shell scripts for creating test tables, listing patients, and pushing patient data.

## Getting Started

To get started with development, you'll need to have Docker and Node.js installed. Then, you can run `docker-compose -f docker-compose.deps.yml up` to start the dependencies, and `npm install` in the `apps/kafka-mapper-consumer` directory to install the application's dependencies.

For more information, see the README files in the `apps/kafka-mapper-consumer` and `apps/kafka-mapper-microfrontend` directories.

## License

This project is licensed under the terms of the license found in the [LICENSE](LICENSE) file.
