export interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

export interface GetUserResponse {
  user: User;
}