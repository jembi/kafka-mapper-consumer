import { ClickHouse } from "clickhouse";
import { Table } from "src/types";

const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST ?? "localhost";
const CLICKHOUSE_PORT = parseInt(process.env.CLICKHOUSE_PORT ?? "8124");

const clickhouse = new ClickHouse({
  url: CLICKHOUSE_HOST,
  port: CLICKHOUSE_PORT,
  debug: true,
});

const insertQuery = (tableName: string, data: object) => `INSERT INTO ${tableName}(${Object.keys(data).join(", ")}) VALUES('${Object.values(data).join("', '")}')`;

export const loadDataIntoClickhouse = async (table: Table) => clickhouse.insert(insertQuery(table.name, table.rows)).toPromise();
