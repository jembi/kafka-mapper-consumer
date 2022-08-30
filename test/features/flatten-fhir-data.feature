Feature: Flatten FHIR data
    As a user
    I want to successfuly flatten a fhir data structure to map to my table columns

    Scenario: Happy Flow
        Given I receive "happy-flow" entry
        And I provide "happy-flow" fhir-mapping
        When The consumer runs
        Then I expect "happy-flow" table-mappings

    Scenario: A filter that matches
        Given I receive "filter-match" entry
        And I provide "filter-match" fhir-mapping
        When The consumer runs
        Then I expect "filter-match" table-mappings

    Scenario: A filter that does not match
        Given I receive "filter-no-match" entry
        And I provide "filter-no-match" fhir-mapping
        When The consumer runs
        Then I expect "filter-no-match" table-mappings

    Scenario: A valid plugin
        Given I receive "valid-plugin" entry
        And I provide "valid-plugin" fhir-mapping
        When The consumer runs
        Then I expect "valid-plugin" table-mappings

    Scenario: A plugin with invalid parameter signature
        Given I receive "plugin-missing-function" entry
        And I provide "plugin-missing-function" fhir-mapping
        When The consumer runs
        Then I expect "plugin-missing-function" table-mappings

    Scenario: A plugin with invalid parameter signature
        Given I receive "plugin-missing-file" entry
        And I provide "plugin-missing-file" fhir-mapping
        When The consumer runs
        Then I expect "plugin-missing-file" table-mappings
    
