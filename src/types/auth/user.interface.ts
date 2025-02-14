export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum RegistrationType {
  EMAIL = 'email',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  MICROSOFT = 'microsoft',
}

export interface IUser {
  userId?: string;
  email: string;
  password: string;
  name: string;
  profilePicture: string;
  createdAt: Date;
  lastLogin?: Date;
  role: UserRole;
  registrationType: RegistrationType;
  isEmailVerified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}
