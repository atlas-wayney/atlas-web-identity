// Auth request and response types based on API spec

export interface LoginRequest {
  login_id: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  login_id: string;
  user_name: string;
  email: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ForgetPasswordRequest {
  email: string;
}

export interface ForgetPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Auth state for context
export interface AuthUser {
  user_id: string;
  user_name: string;
  email: string;
  access_token: string;
}

export interface CreateAccountRequest {
  login_id: string;
  name: string;
  email: string;
  phone: string;
  roles: Record<string, string>;
}

export interface CreateAccountResponse {
  user_id: string;
  message: string;
}
