import { Types } from 'mongoose';
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

export interface UserBasicData {
  _id: Types.ObjectId;
  avatar: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}
