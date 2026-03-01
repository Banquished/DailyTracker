export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  email: string;
  name: string;
  password: string;
};

export type AuthToken = {
  access_token: string;
  token_type: string;
};
