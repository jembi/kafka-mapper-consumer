export interface Resource {
  resourceType: string;
  id: string;
}

export interface Entry {
  resource: Resource;
}

export interface Bundle {
  entry: Entry[];
}
