import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import {
  BaseQueryOptions,
  BaseRepository,
} from 'src/share/base-class/base-repository.service';
import {
  CreateUserData,
  UserBasicData,
  UserFriendsContextData,
  UserFriendsData,
  UserProfile,
} from '../interfaces';
import { UserDocument } from 'src/schemas';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }
  async findUserWithFriend(
    userId: string,
    friendId: string,
  ): Promise<UserDocument | null> {
    return this.findOne({
      _id: new Types.ObjectId(userId),
      friends: new Types.ObjectId(friendId),
    });
  }
  async findByEmail(
    email: string,
    options?: BaseQueryOptions<UserDocument>,
  ): Promise<UserDocument | null> {
    return this.findOne({ email }, options);
  }
  async findByUsername(
    username: string,
    options?: BaseQueryOptions<UserDocument>,
  ): Promise<UserDocument | null> {
    return this.findOne({ username }, options);
  }
  async findByEmailAndVerified(email: string): Promise<UserDocument | null> {
    return this.findOne(
      { email, isVerified: true },
      { projection: '+password' },
    );
  }
  async findByIdBasic(userId: string): Promise<UserBasicData | null> {
    return this.findLeanedById<UserBasicData>(userId, {
      projection: 'avatar email firstName lastName username',
    });
  }

  async findProfileByUsername(username: string): Promise<UserProfile | null> {
    return this.findOneLean<UserProfile>(
      { username },
      {
        projection:
          'firstName lastName username avatar coverPhoto ' +
          'privacySettings friendCount bio work currentLocation friends',
      },
    );
  }

  async findFriendsListById(
    userId: Types.ObjectId | string,
    limit: number,
  ): Promise<UserFriendsData | null> {
    return this.model
      .findById(userId)
      .populate({
        path: 'friends',
        select: 'firstName lastName username avatar',
        options: { limit },
      })
      .select('friends')
      .lean()
      .exec() as unknown as Promise<UserFriendsData | null>;
  }

  async findUserFriendsContextByUsername(
    username: string,
  ): Promise<UserFriendsContextData | null> {
    return this.findOneLean<UserFriendsContextData>(
      { username },
      {
        projection: 'friendCount privacySettings.friendList',
      },
    );
  }
  async findUserIdByUsername(
    username: string,
  ): Promise<{ _id: string } | null> {
    return this.findOneLean<{ _id: string }>(
      { username },
      { projection: '_id' },
    );
  }
  async createUser(userDto: CreateUserData): Promise<UserDocument> {
    const user = new this.userModel(userDto);
    return user.save();
  }

  async deleteMany(
    filter: FilterQuery<UserDocument>,
  ): Promise<{ deletedCount: number }> {
    const result = await this.model.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }
}
