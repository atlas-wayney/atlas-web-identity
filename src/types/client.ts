import { AuditFields } from "./common";

export interface Subclient extends AuditFields {
  subclient_id: string;
  subclient_name: string;
  subclient_status: string;
  parent_subclient_id: string;
  client_id: string;
  client_name: string;
  country: string;
  region: string;
  tags: string[];
}

export interface SubclientForm {
  subclient_name: string;
  subclient_status: string;
  parent_subclient_id: string;
  client_id: string;
  client_name: string;
  country: string;
  region: string;
  tags: string[];
}

export interface SubclientRef {
  subclient_id: string;
  subclient_name: string;
  client_id?: string;
}
