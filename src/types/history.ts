import { AuditFields } from "./common";

export interface History extends AuditFields {
  history_id: string;
  entity_type: string;
  entity_id?: string;
  action: string;
  description: string;
  internal_only: boolean;
}

export interface HistoryForm {
  entity_type: string;
  entity_id?: string;
  action: string;
  description: string;
  internal_only?: boolean;
}
