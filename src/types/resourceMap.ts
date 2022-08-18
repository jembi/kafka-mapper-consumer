export interface MapItem {
  key: string;
  value: string;
}

export interface ResourceMap {
  [name: string]: MapItem[];
}
