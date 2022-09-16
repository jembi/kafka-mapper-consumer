import { ClickHouse } from "clickhouse";
import { Table } from "src/types";

const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST ?? "localhost";
const CLICKHOUSE_PORT = parseInt(process.env.CLICKHOUSE_PORT ?? "8124");

const clickhouse = new ClickHouse({
  url: CLICKHOUSE_HOST,
  port: CLICKHOUSE_PORT,
  debug: true,
});

const selectQuery = (table: Table) => `SELECT id FROM ${table.name} WHERE id='${table.rows['id']}'`;

const alterQuery = (table: Table) => `ALTER TABLE ${table.name} UPDATE ${Object.entries(table.rows).map(([key, value]) => `${key}='${value}'`).join(",")} WHERE id='${table.rows['id']}'`;

const insertQuery = (tableName: string, data: object) => `INSERT INTO ${tableName}(${Object.keys(data).join(", ")}) VALUES('${Object.values(data).join("', '")}')`;

export const selectByIdClickhouse = async (table: Table) => clickhouse.query(selectQuery(table)).toPromise();

export const alterRowIntoClickhouse = async (table: Table) => clickhouse.query(alterQuery(table)).toPromise();

export const loadDataIntoClickhouse = async (table: Table) => clickhouse.insert(insertQuery(table.name, table.rows)).toPromise();
