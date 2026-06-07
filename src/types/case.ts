import { AuditFields } from "./common";

export interface Case extends AuditFields {
  case_id: string;
  case_status: string;
  assigned_user_id: string;
  assigned_user_name: string;
  case_type: string;
  title: string;
  client_id?: string;
  client_name?: string;
  subclient_id?: string;
  subclient_name?: string;
  entity_type: string;
  entity_id?: string;
  data: Record<string, unknown>;
}

export interface CaseForm {
  case_status: string;
  assigned_user_id: string;
  assigned_user_name: string;
  case_type: string;
  title: string;
  client_id?: string;
  client_name?: string;
  subclient_id?: string;
  subclient_name?: string;
  entity_type: string;
  entity_id?: string;
  data: Record<string, unknown>;
}

export interface CaseStatusForm {
  case_status: string;
  assigned_user_id: string;
  assigned_user_name: string;
  remark: string;
}
