import Ajv from 'ajv'
import fs from 'fs'
import path from 'path'
import fhirpath from 'fhirpath'
import {
  Entry,
  FhirMapping,
  Table,
  PluginScript,
  FhirPlugin,
  instanceOfTable
} from './types'

const ajv = new Ajv({allErrors: true, strictTuples: false})
const schema = require('../schema/fhir-mapping.schema.json')
delete schema['$schema']
const validate = ajv.compile(schema)

const hasUniqueResourceTypes = (fhirMappings: FhirMapping[]): Boolean => {
  const resourceTypes = fhirMappings.map(
    fhirMapping => fhirMapping.resourceType
  )
  const uniqueResourceTypes = [...new Set(resourceTypes)]
  const hasUniqueResourceTypes =
    uniqueResourceTypes.length === fhirMappings.length
  return hasUniqueResourceTypes
}

const getPluginScriptNames = (fhirMappings: FhirMapping[]) => {
  let pluginScriptNames = []
  fhirMappings.forEach(fhirMapping => {
    fhirMapping.tableMappings.forEach(tableMapping => {
      if (tableMapping.plugin) {
        pluginScriptNames.push(tableMapping.plugin)
      }
    })
  })
  const uniquePluginScriptNames = [...new Set(pluginScriptNames)]

  return uniquePluginScriptNames
}

const validatePluginScriptsExist = (fhirMappings: FhirMapping[]): Error[] => {
  const errors: Error[] = []
  const pluginScriptNames = getPluginScriptNames(fhirMappings)

  pluginScriptNames.forEach(pluginName => {
    const doesExist = fs.existsSync(
      path.resolve(__dirname, `./plugin/${pluginName}`)
    )
    if (!doesExist)
      errors.push(
        new Error(
          `Could not find plugin: "${pluginName}" in the plugin directory`
        )
      )
  })
  return errors
}

const validatePluginScriptsFunction = (
  fhirMappings: FhirMapping[]
): Error[] => {
  const errors: Error[] = []
  const pluginScriptNames = getPluginScriptNames(fhirMappings)

  pluginScriptNames.forEach(pluginName => {
    const doesExist = fs.existsSync(
      path.resolve(__dirname, `./plugin/${pluginName}`)
    )
    if (doesExist) {
      try {
        const pluginScript: PluginScript = require(`./plugin/${pluginName}`)
        if (typeof pluginScript?.plugin !== 'function')
          throw new Error('Plugin function is not exported from plugin script')
      } catch (error) {
        if (error?.message) {
          errors.push(new Error(error.message))
        } else {
          errors.push(
            new Error(
              `Error occured while trying to load plugin from ${pluginName}`
            )
          )
        }
      }
    }
  })
  return errors
}

export const validateFhirMappingsJson = (
  fhirMappings: FhirMapping[]
): Error[] => {
  let errors: Error[] = []

  if (!hasUniqueResourceTypes(fhirMappings))
    errors.push(new Error('Duplicate resource type '))

  errors = [...errors, ...validatePluginScriptsExist(fhirMappings)]
  errors = [...errors, ...validatePluginScriptsFunction(fhirMappings)]

  if (!validate(fhirMappings)) {
    errors = [
      ...errors,
      ...(validate.errors?.map(error => new Error(error.message)) ?? [])
    ]
  }

  return errors
}

export const getFhirPlugins = (
  fhirMappings: FhirMapping[]
): Map<string, FhirPlugin> => {
  const fhirPlugins = new Map<string, FhirPlugin>()
  const pluginScriptNames = getPluginScriptNames(fhirMappings)
  pluginScriptNames.forEach(pluginScriptName => {
    const pluginScript: PluginScript = require(`./plugin/${pluginScriptName}`)
    fhirPlugins.set(pluginScriptName, pluginScript.plugin)
  })
  return fhirPlugins
}

const NUM_DEFAULT_RESOURCE_ATTRIBUTES = 3
const removeEmptyTableMappings = (tables: Table[]): Table[] =>
  tables.filter(
    table => Object.keys(table.rows).length > NUM_DEFAULT_RESOURCE_ATTRIBUTES
  )

const firstOrDefault = (arr: any[], defaultValue: any = null) =>
  arr?.length > 0 ? arr[0] : defaultValue

const mapDefaultResourceAttributes = (table: Table, entry: Entry) => {
  const returnTable: Table = {...table}
  returnTable.rows['id'] = firstOrDefault(
    fhirpath.evaluate(entry.resource, `${entry.resource.resourceType}.id`)
  )
  returnTable.rows['version'] = firstOrDefault(
    fhirpath.evaluate(
      entry.resource,
      `${entry.resource.resourceType}.meta.versionId`
    )
  )
  returnTable.rows['last_updated'] = firstOrDefault(
    fhirpath.evaluate(
      entry.resource,
      `${entry.resource.resourceType}.meta.lastUpdated`
    )
  )
  return returnTable
}

export const getTableMappings = (
  fhirMappings: FhirMapping[],
  entry: Entry,
  plugins: Map<string, FhirPlugin>
): Table[] => {
  let tables: Table[] = []

  const fhirMapping = fhirMappings.find(
    fm => fm.resourceType === entry.resource.resourceType
  )

  fhirMapping?.tableMappings.forEach(tableMapping => {
    let table = tables.find(t => t.name === tableMapping.targetTable)
    if (!table) {
      table = {
        name: tableMapping.targetTable,
        rows: {}
      }
      tables.push(table)
      mapDefaultResourceAttributes(table, entry)
    }

    let matchFilter = tableMapping.filter
      ? firstOrDefault(fhirpath.evaluate(entry.resource, tableMapping.filter))
      : true
    if (matchFilter) {
      tableMapping.columnMappings.forEach(columnMapping => {
        if (table) {
          // TODO: find out how we should handle multiple return values of the fhirpath evaluation
          table.rows[columnMapping.columnName] = firstOrDefault(
            fhirpath.evaluate(entry.resource, columnMapping.fhirPath)
          )
        }
      })

      if (tableMapping.plugin) {
        try {
          const plugin = plugins.get(tableMapping.plugin)
          const pluginResult = plugin(table, entry, tableMapping)
          if (pluginResult && instanceOfTable(pluginResult)) {
            table = pluginResult
          }
        } catch (error) {
          console.error(
            `An error occured while trying to process plugin ${tableMapping.plugin}`
          )
          console.error(error)
        }
      }
    }
  })

  tables = removeEmptyTableMappings(tables)

  return tables
}

// Mappings of the raw tables
const clickHouseTableMap = {
  Organization: {
    targetTable: 'raw_organization',
    columnMappings: {
      id: 'String',
      name: 'String',
      active: 'Bool',
      ['identifier.system']: 'String',
      ['identifier.value']: 'String',
      ['address.city']: 'String',
      ['address.district']: 'String',
      ['address.state']: 'String',
      ['address.line']: ['String'],
      ['type.text']: 'String',
      ['type.coding']: ['display', 'system', 'code']
    }
  },
  Patient: {
    targetTable: 'raw_patient',
    columnMappings: {
      id: 'String',
      gender: 'String',
      birthDate: 'Bool',
      ['name.use']: 'String',
      ['name.family']: 'String',
      ['name.given']: ['String'],
      ['telecom.use']: 'String',
      ['telecom.system']: 'String',
      ['telecom.value']: 'String',
      ['identifier.system']: 'String',
      ['identifier.value']: 'String',
      ['address.type']: 'String',
      ['address.text']: 'String',
      ['address.city']: 'String',
      ['address.district']: 'String',
      ['address.state']: 'String',
      ['address.line']: ['String'],
      ['maritalStatus.text']: 'String',
      ['maritalStatus.coding']: ['display', 'system', 'code'],
      ['managingOrganization.reference']: 'String',
      ['extension.url']: 'String',
      ['extension.value']: ['JSON']
    }
  },
  Encounter: {
    targetTable: 'raw_encounter',
    columnMappings: {
      id: 'String',
      status: 'String',
      ['period.end']: 'Date',
      ['period.start']: 'Date',
      ['identifier.system']: 'String',
      ['identifier.value']: 'String',
      ['serviceType.text']: 'String',
      ['serviceType.coding']: ['display', 'system', 'code'],
      ['type.text']: 'String',
      ['type.coding']: ['display', 'system', 'code'],
      ['subject.reference']: 'String',
      ['extension.url']: 'String',
      ['extension.value']: ['JSON']
    }
  },
  MedicationDispense: {
    targetTable: 'raw_medication_dispense',
    columnMappings: {
      id: 'String',
      status: 'String',
      ['quantity.value']: 'String',
      ['quantity.system']: 'String',
      ['quantity.code']: 'String',
      ['quantity.unit']: 'String',
      ['daysSupply.value']: 'String',
      ['daysSupply.system']: 'String',
      ['daysSupply.code']: 'String',
      ['daysSupply.unit']: 'String',
      ['medicationCodeableConcept.text']: 'String',
      ['medicationCodeableConcept.coding']: ['display', 'system', 'code'],
      ['statusReasonCodeableConcept.text']: 'String',
      ['statusReasonCodeableConcept.coding']: ['display', 'system', 'code'],
      ['subject.reference']: 'String',
      ['context.reference']: 'String',
      ['extension.url']: 'String',
      ['extension.value']: ['JSON']
    }
  },
  MedicationStatement: {
    targetTable: 'raw_medication_statement',
    columnMappings: {
      id: 'String',
      status: 'String',
      ['effectivePeriod.end']: 'Date',
      ['effectivePeriod.start']: 'Date',
      ['medicationCodeableConcept.text']: 'String',
      ['medicationCodeableConcept.coding']: ['display', 'system', 'code'],
      ['reasonCode.text']: 'String',
      ['reasonCode.coding']: ['display', 'system', 'code'],
      ['category.text']: 'String',
      ['category.coding']: ['display', 'system', 'code'],
      ['subject.reference']: 'String',
      ['context.reference']: 'String',
      ['extension.url']: 'String',
      ['extension.value']: ['JSON']
    }
  }
}

// A function to get a value from a path
// Added a new param json (a boolean) for the extensions use case to return a JSON stringify of the object
const getObjectPropertyValue = (obj, path, json = false) => {
  const keys = path.split('.')
  const res = keys.reduce((acc, key) => {
    if (!acc) {
      return acc
    }
    if (acc && Array.isArray(acc) && !json) {
      return acc.map(e => getObjectPropertyValue(e, key))
    }
    if (acc && Array.isArray(acc) && json) {
      return acc.map(e => {
        if (e.url) delete e.url
        return JSON.stringify(e)
      })
    }
    if (acc[key] === undefined) {
      return undefined
    }
    return acc[key]
  }, obj)
  return res
}

function getRaws(mappings, entry) {
  const columns = Object.keys(mappings)
  const data = columns.reduce((prev, curr) => {
    const elements = curr.split('.')

    // This is when the value is an object and we want to save all the object in a string
    if (mappings[curr] === 'JSON') {
      const entryValue = getObjectPropertyValue(entry, curr)
      if (entryValue) {
        return {...prev, [`${curr}`]: `'${JSON.stringify(entryValue)}'`}
      }
      return {...prev, [`${curr}`]: 'NULL'}
    }
    // When the element is not nested and the value is not a JSON
    if (elements.length === 1) {
      const entryValue = getObjectPropertyValue(entry, curr)
      if (entryValue) {
        return {...prev, [`${curr}`]: `'${entryValue}'`}
      }
      return {...prev, [`${curr}`]: 'NULL'}
    }
    // If the element is level 1 nested and the expected value isn't an array
    if (elements.length === 2 && !Array.isArray(mappings[curr])) {
      const entryValue = getObjectPropertyValue(entry, curr)
      if (entryValue && Array.isArray(entryValue)) {
        return {...prev, [`${curr}`]: `['${entryValue.join("', '")}']`}
      } else if (entryValue) {
        return {...prev, [`${curr}`]: `['${entryValue}']`}
      }
      return {...prev, [`${curr}`]: `['NULL']`}
    }
    // If the element is:
    //  -  level 1 nested and the expected value is an array (e.g array of strings)
    //  -  level 2 nested (we supply an array with the expected nested elements in the expected order)
    //  -  level 2+ nested and the element is an extension
    if (elements.length === 2 && Array.isArray(mappings[curr])) {
      // level 1 nested and expected value is an array of string (e.g address.line = ['30', 'Street 2'])
      if (mappings[curr][0] === 'String') {
        const entryValue = getObjectPropertyValue(entry, curr)
        const value =
          entryValue && Array.isArray(entryValue)
            ? entryValue.map(element => element.map(element => `'${element}'`))
            : [entryValue]
        return {
          ...prev,
          [`${curr}`]: `[${value.map(element => `[${element}]`).join(', ')}]`
        }
      }
      // level 2+ nested and element is extension (to save the value of the extension as a JSON)
      if (mappings[curr][0] === 'JSON' && curr === 'extension.value') {
        const entryValue = getObjectPropertyValue(entry, curr, true)
        if (entryValue) {
          const value =
            entryValue && Array.isArray(entryValue) ? entryValue : [entryValue]
          return {
            ...prev,
            [`${curr}`]: `[${value.map(element => `'${element}'`).join(', ')}]`
          }
        }
        return {...prev, [`${curr}`]: `['NULL']`}
      }

      // level 2 nested (we supply an array with the expected nested elements in the expected order)
      // (e.g in the mapping: type.coding = ['display', 'code', 'system'], we need to save the in the order : values: [[('display1', 'code1', 'system1')]])
      const nested = getObjectPropertyValue(entry, curr)
      if (nested) {
        const value = mappings[curr]
          .map(e => {
            const entryValue = getObjectPropertyValue(entry, `${curr}.${e}`)
            return entryValue
          })
          .join("', '")

        return {...prev, [`${curr}`]: `[[('${value}')]]`}
      }
      return {...prev, [`${curr}`]: '[[]]'}
    }
    return {...prev, [`${curr}`]: 'NULL'}
  }, {})

  return data
}

export function getRawTableMappings(resourceType, entry) {
  const tableDefinition = clickHouseTableMap[resourceType]

  if (!tableDefinition) {
    throw new Error(
      `Table definition not found for resource type: ${resourceType}`
    )
  }
  const data = getRaws(tableDefinition.columnMappings, entry)

  return {name: tableDefinition.targetTable, rows: data}
}
