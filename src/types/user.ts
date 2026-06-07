import { AuditFields } from "./common";

export interface User extends AuditFields {
  user_id: string;
  login_id: string;
  user_name: string;
  user_status: string;
  email: string;
  phone: string;
  internal: boolean;
  client_id?: string;
  client_name?: string;
  roles: Record<string, string>;
}

export interface UserForm {
  login_id: string;
  user_name: string;
  user_status: string;
  email: string;
  phone: string;
  internal: boolean;
  client_id?: string;
  client_name?: string;
  roles: Record<string, string>;
}
