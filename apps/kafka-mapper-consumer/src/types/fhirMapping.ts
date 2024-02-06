export interface ColumnMapping {
  columnName: string;
  fhirPath: string;
}

export interface TableMapping {
  targetTable: string;
  columnMappings: ColumnMapping[];
  filter?: string;
  plugin?: string;
}

export interface FhirMapping {
  resourceType: string;
  tableMappings: TableMapping[];
}
