import {Given, When, Then} from 'cucumber'
import {Entry, FhirMapping, TableMapping} from '../../src/types'
import {getTableMappings, getFhirPlugins} from '../../src/util'

import chai from 'chai'
import chaiArrays from 'chai-arrays'
import chaiThings from 'chai-things'
const {expect} = chai
chai.should()
chai.use(chaiArrays)
chai.use(chaiThings)

Given('I receive {string} entry', function (testFolder: string) {
  const entry: Entry = require(`../data/mapping/${testFolder}/entry.json`)
  expect(entry).to.exist
  this.entry = entry
})

Given('I provide {string} fhir-mapping', function (testFolder: string) {
  const fhirMapping: FhirMapping[] = require(`../data/mapping/${testFolder}/fhir-mapping.json`)
  expect(fhirMapping).to.exist
  this.fhirMapping = fhirMapping
  const plugins = getFhirPlugins(fhirMapping)
  expect(plugins).to.exist
  this.plugins = plugins
})

When('The consumer runs', function () {
  const tableMappingOutcome = getTableMappings(
    this.fhirMapping,
    this.entry,
    this.plugins
  )
  expect(tableMappingOutcome).to.exist
  this.tableMappingOutcome = tableMappingOutcome
})

Then('I expect {string} table-mappings', function (testFolder: string) {
  const tableMappings: TableMapping = require(`../data/mapping/${testFolder}/table-mappings.json`)
  expect(tableMappings).to.exist
  expect(this.tableMappingOutcome).to.deep.equal(tableMappings)
})
