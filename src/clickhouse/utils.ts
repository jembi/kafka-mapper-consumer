import { ClickHouse } from "clickhouse";

const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST ?? "localhost";
const CLICKHOUSE_PORT = parseInt(process.env.CLICKHOUSE_PORT ?? "8124");

const clickhouse = new ClickHouse({
  url: CLICKHOUSE_HOST,
  port: CLICKHOUSE_PORT,
  debug: true,
});

const insertQuery = (tableName: string, data: object) => `INSERT INTO ${tableName}(${Object.keys(data).join(", ")}) VALUES('${Object.values(data).join("', '")}')`;

export async function loadDataIntoClickhouse(tableName: string, data: object) {
  try {
    const response = await clickhouse.insert(insertQuery(tableName, data)).toPromise();
    console.log(`Successfully added data into ${tableName} table`, response);
  } catch (error: unknown) {
    console.error(`Couldn't insert data into ${tableName} table`, error);
  }
}
