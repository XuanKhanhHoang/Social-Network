import { Gender } from 'src/share/enums';

export interface CreateUserData {
  firstName: string;
  email: string;
  password: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
  username: string;
}
