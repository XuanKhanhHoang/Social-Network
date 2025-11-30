import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Gender, UserPrivacy } from 'src/share/enums';
import { SubMedia } from './sub-comment-media.schema';

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
  provinceCode: UserPrivacy;

  @Prop({
    type: String,
    enum: [UserPrivacy.FRIENDS, UserPrivacy.PRIVATE],
    default: UserPrivacy.FRIENDS,
  })
  friendList: UserPrivacy;

  @Prop({
    type: String,
    enum: UserPrivacy,
    default: UserPrivacy.FRIENDS,
  })
  friendCount: UserPrivacy;

  @Prop({
    type: String,
    enum: UserPrivacy,
    default: UserPrivacy.FRIENDS,
  })
  currentLocation: UserPrivacy;
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

  @Prop({ required: false, default: null, type: String })
  phoneNumber: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  birthDate: Date;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ default: null, type: SubMedia })
  avatar: SubMedia;

  @Prop({ default: null, type: SubMedia })
  coverPhoto: SubMedia;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: '', maxLength: 250 })
  bio: string;

  @Prop({ default: '' })
  work: string;

  @Prop({ default: '' })
  currentLocation: string;

  @Prop({ default: null })
  provinceCode: string;

  @Prop({ type: String, default: null })
  detectedCity: string;

  @Prop({ type: String, default: null })
  lastKnownIp: string;

  @Prop({ type: Date, default: null })
  lastDetectedLocationUpdatedAt: Date;

  @Prop({ type: Date, default: null, index: true })
  lastActiveAt: Date;

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
UserSchema.index(
  { phoneNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phoneNumber: { $ne: null },
    },
  },
);

mongoose.model('User', UserSchema);
