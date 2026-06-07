// Base audit fields shared by all response types
export interface AuditFields {
  create_time: string;
  creater_id: string;
  creater_name: string;
  update_time: string;
  updater_id: string;
  updater_name: string;
}

// Entity status update request
export interface EntityStatusForm {
  entity_type: string;
  entity_id: string;
  status: string;
  remark: string;
}
