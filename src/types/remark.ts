import { AuditFields } from "./common";

export interface Remark extends AuditFields {
  remark_id: string;
  entity_type: string;
  entity_id?: string;
  remark: string;
  internal_only: boolean;
}

export interface RemarkForm {
  entity_type: string;
  entity_id?: string;
  remark: string;
  internal_only?: boolean;
}
