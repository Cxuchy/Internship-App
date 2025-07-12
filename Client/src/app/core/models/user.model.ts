export interface User {
  //_id?: string; // MongoDB document ID
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  profilePicture?: string;
  //createdAt?: Date;
}
