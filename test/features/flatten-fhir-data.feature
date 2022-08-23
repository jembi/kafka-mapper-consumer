Feature: Flatten FHIR data
    As a user
    I want to be able to successfuly flatten a fhir data structure to map to my table columns

    Scenario: Happy Flow
        Given I receive "happy-flow" entry
        And I provide "happy-flow" fhir-mapping
        When The consumer runs
        Then I expect "happy-flow" table-mappings
    
