import { AuditFields } from "./common";

export interface Config extends AuditFields {
  entity_type: string;
  field_name: string;
  options: string[];
}

export interface ConfigForm {
  entity_type: string;
  field_name: string;
  options: string[];
}
