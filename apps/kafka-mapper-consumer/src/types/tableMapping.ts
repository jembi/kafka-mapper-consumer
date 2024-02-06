import { LooseObject } from "./loose";

export interface Table {
  name: string;
  rows: LooseObject;
}

export const instanceOfTable = (object: any): object is Table => {
  return "name" in object && "rows" in object;
};
