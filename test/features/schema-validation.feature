Feature: Schema Validation
    As a user
    I want to ensure that the provided fhir-mapping json file is valid in accordance with its schema

    Scenario: Happy Flow
        Given I provide "happy-flow" fhir-mapping for validation
        When The fhir mapping is validated against the schema
        Then I expect "happy-flow" errors

    Scenario: Duplicate Resource Type
        Given I provide "duplicate-resource-type" fhir-mapping for validation
        When The fhir mapping is validated against the schema
        Then I expect "duplicate-resource-type" errors

    Scenario: Missing Target Table
        Given I provide "missing-target-table" fhir-mapping for validation
        When The fhir mapping is validated against the schema
        Then I expect "missing-target-table" errors
    