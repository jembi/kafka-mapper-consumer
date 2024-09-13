import {ClickHouse} from 'clickhouse'
import {Table} from '../../src/types'

const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST ?? 'localhost'
const CLICKHOUSE_PORT = parseInt(process.env.CLICKHOUSE_PORT ?? '8124')
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD ?? ''

const clickhouse = new ClickHouse({
  url: CLICKHOUSE_HOST,
  port: CLICKHOUSE_PORT,
  debug: true,
  basicAuth: {
    username: 'default',
    password: CLICKHOUSE_PASSWORD
  }
})

const selectQuery = (table: Table) =>
  `SELECT id FROM ${table.name} WHERE id='${table.rows['id']}'`

const alterQuery = (table: Table) =>
  `ALTER TABLE ${table.name} UPDATE ${Object.entries(table.rows)
    .map(([key, value]) =>
      value !== null ? `${key}='${value}'` : `${key}=NULL`
    )
    .join(',')} WHERE id='${table.rows['id']}'`

const insertQuery = (tableName: string, data: object) => {
  const filteredData = Object.keys(data).reduce((obj, key) => {
    if (data[key] !== null) {
      obj[key] = data[key]
    }
    return obj
  }, {})
  return `INSERT INTO ${tableName}(${Object.keys(filteredData).join(
    ', '
  )}) VALUES('${Object.values(filteredData).join("', '")}')`
}

export const selectByIdClickhouse = (table: Table) =>
  clickhouse.query(selectQuery(table)).toPromise()

export const alterRowIntoClickhouse = (table: Table) =>
  clickhouse.query(alterQuery(table)).toPromise()

export const loadDataIntoClickhouse = (table: Table) =>
  clickhouse.insert(insertQuery(table.name, table.rows)).toPromise()
