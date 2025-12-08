export interface Website {
  id: string;
  name: string;
  url: string;
}

export interface LoginRequest {
  website: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  deals: string[];
  message: string;
}

export interface User {
  website: string;
  username: string;
  token: string;
}

