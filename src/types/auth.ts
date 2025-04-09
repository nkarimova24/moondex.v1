export interface User {
    id: string;
    name: string | null;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type UserWithoutPassword = Omit<User, 'password'>;
  
  export interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
    };
    expires: string;
  }