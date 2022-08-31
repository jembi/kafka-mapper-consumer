import { Given, When, Then } from "cucumber";
import { FhirMapping } from "src/types";
import { ValidateFhirMappingsJson } from "../../src/util";

import chai from "chai";
import chaiArrays from "chai-arrays";
import chaiThings from "chai-things";
const { expect } = chai;
chai.should();
chai.use(chaiArrays);
chai.use(chaiThings);

Given("I provide {string} fhir-mapping for validation", function (testFolder: string) {
  const fhirMapping: FhirMapping = require(`../data/schema/${testFolder}/fhir-mapping.json`);
  expect(fhirMapping).to.exist;
  this.fhirMapping = fhirMapping;
});

When("The fhir mapping is validated against the schema", function () {
  const validationOutcome = ValidateFhirMappingsJson(this.fhirMapping);
  expect(validationOutcome).to.exist;
  this.validationOutcome = validationOutcome;
});

Then("I expect {string} errors", function (testFolder: string) {
  const errors: Error[] = require(`../data/schema/${testFolder}/errors.json`);
  expect(errors).to.exist;
  expect(errors).to.be.array();
  const validationOutcomeMessages: String[] = this.validationOutcome.map((error: Error) => error.message);
  expect(validationOutcomeMessages).to.include.members(errors);
});
