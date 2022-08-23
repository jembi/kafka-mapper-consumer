import { ClickHouse } from "clickhouse";
import tableQueries from "./tableQueries.json"

const clickhouse = new ClickHouse({}); 

import { tables } from "./tables";

export async function createClickhouseTables(){
    for(const table of tables){
        try{
            const response = await clickhouse.query(table).toPromise();
            console.log(`Successfully created table in Clikchouse: ${response}`) 

        }catch(error: unknown){
            console.log("Couldn't create table in Clickhouse", error)
        }
      }
}

export async function loadDataIntoClickhouse(tableName: string, data: object){
    const resourceDb = tableQueries?.find((query) => query.tableName === tableName);

    if(resourceDb){
        try{
            const response = clickhouse.insert(resourceDb.query, [data])
            console.log(`Successfully added data into ${tableName} table` )
        }
        catch(error: unknown){
            console.error(`Couldn't insert data into ${tableName} table`)
        }

    }else{
        console.error(`We did not find the insert query for table ${tableName}. Please provide one in the tableQueries.json file...`)
    }
    
}
