import { AuditFields } from "./common";

export interface Document extends AuditFields {
  document_id: string;
  document_name: string;
  entity_type: string;
  entity_id?: string;
  bucket: string;
  fullpath: string;
  internal_only: boolean;
  deleted: boolean;
}

export interface DocumentForm {
  document_name: string;
  entity_type: string;
  entity_id?: string;
}
