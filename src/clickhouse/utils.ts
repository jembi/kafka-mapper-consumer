import { ClickHouse } from "clickhouse";
import db from "./db.json"

const clickhouse = new ClickHouse({}); 

import { tables } from "./tables";

export async function createClickhouseTables(){
    for(const table of tables){
        try{
            const response = await clickhouse.query(table).toPromise();
            console.log(`successfully created tables in Clikchouse: ${response}`) 

        }catch(_){
            console.log("Couldn't create tables in Clickhouse")
        }
      }
}

export async function loadDataIntoClickHouse(tableName: string, data: object){
    const resourceDb = db?.find((db) => db.tableName === tableName);

    if(resourceDb){
        try{
            const response =  clickhouse.insert(resourceDb.query, [data])
            //message
        }
        catch(_){
            console.log(`Couldn't insert data into ${tableName} table`)
        }

    }else{
        console.log(`We did not find the insert query for table ${tableName}. Please, provide one...`)
    }
    
}
