import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Gender, UserPrivacy } from 'src/share/enums';

@Schema({ _id: false })
export class PrivacySettings {
  @Prop({
    type: String,
    enum: UserPrivacy,
    default: UserPrivacy.PUBLIC,
  })
  work: UserPrivacy;

  @Prop({
    type: String,
    enum: UserPrivacy,
    default: UserPrivacy.PUBLIC,
  })
  currentLocation: UserPrivacy;

  @Prop({
    type: String,
    enum: UserPrivacy,
    default: UserPrivacy.FRIENDS,
  })
  friendList: UserPrivacy;
}

const PrivacySettingsSchema = SchemaFactory.createForClass(PrivacySettings);
@Schema({ timestamps: true, collection: 'users' })
export class UserDocument extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  username: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: false, unique: true, sparse: true, default: null })
  phoneNumber: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  birthDate: Date;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  coverPhoto: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: '', maxLength: 250 })
  bio: string;

  @Prop({ default: '' })
  work: string;

  @Prop({ default: '' })
  currentLocation: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: UserDocument.name }],
    default: [],
  })
  friends: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  friendCount: number;
  @Prop({
    type: PrivacySettingsSchema,
    default: () => ({}),
  })
  privacySettings: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
