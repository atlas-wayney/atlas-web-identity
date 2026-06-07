import { AuditFields } from "./common";

export interface Client extends AuditFields {
  client_id: string;
  client_name: string;
  client_status: string;
  supported_email_domains: string[];
  allowed_apps: string[];
  tags: string[];
  terms_acceptances?: Record<string, string>;
}

export interface ClientForm {
  client_name: string;
  client_status: string;
  supported_email_domains: string[];
  allowed_apps: string[];
  tags: string[];
  terms_acceptances?: Record<string, string>;
}

export interface ClientRef {
  client_id: string;
  client_name: string;
}

export interface ClientUpdate {
  client_name?: string;
  client_status?: string;
  supported_email_domains?: string[];
  allowed_apps?: string[];
}
