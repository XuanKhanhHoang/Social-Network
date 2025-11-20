import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import {
  BaseQueryOptions,
  BaseRepository,
} from 'src/share/base-class/base-repository.service';
import { UserDocument } from 'src/schemas';
import {
  UserMinimalModel,
  UserMinimalWithEmailModel,
  UserFriendsContextResult,
  UserProfileModel,
  CreateUserData,
} from './interfaces';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel('User')
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
  async getIdBysUsername(
    username: string,
    options?: BaseQueryOptions<UserDocument>,
  ): Promise<Types.ObjectId | null> {
    const user = await this.findOne(
      { username },
      { projection: '_id', ...options },
    );
    return (user?._id || null) as Types.ObjectId | null;
  }
  async findByEmailAndVerified(email: string): Promise<UserDocument | null> {
    return this.findOne(
      { email, isVerified: true },
      { projection: '+password' },
    );
  }
  async findByIdBasic(
    userId: string,
  ): Promise<UserMinimalWithEmailModel<Types.ObjectId> | null> {
    return this.findLeanedById(userId, {
      projection: 'avatar email firstName lastName username',
    });
  }

  async findProfileByUsername(
    username: string,
  ): Promise<UserProfileModel<Types.ObjectId> | null> {
    return this.findOneLean(
      { username },
      {
        projection:
          'firstName lastName username avatar coverPhoto ' +
          'privacySettings friendCount bio work currentLocation friends',
      },
    );
  }

  async findFriendsList({
    userId,
    limit,
    cursor,
  }: {
    userId: string;
    limit: number;
    cursor?: number;
  }): Promise<{
    data: UserMinimalModel<Types.ObjectId>[];
    nextCursor: number | null;
  }> {
    const skip = cursor || 0;

    const userWithPartialFriends = await this.model
      .findById(userId)
      .select({
        friends: { $slice: [skip, limit] },
      })
      .lean()
      .exec();

    if (!userWithPartialFriends) {
      throw new NotFoundException('User not found');
    }

    const friendIdsToFetch = userWithPartialFriends.friends || [];

    if (friendIdsToFetch.length === 0) {
      return { data: [], nextCursor: null };
    }

    const friendsData = (await this.model
      .find({
        _id: { $in: friendIdsToFetch },
      })
      .select('firstName lastName username avatar')
      .lean()
      .exec()) as unknown as UserMinimalModel<Types.ObjectId>[];

    const friendMap = new Map<string, UserMinimalModel<Types.ObjectId>>();
    friendsData.forEach((friend) =>
      friendMap.set(friend._id.toString(), friend),
    );

    const orderedFriends = friendIdsToFetch
      .map((id) => friendMap.get(id.toString()))
      .filter((f) => f) as UserMinimalModel<Types.ObjectId>[];

    const nextCursor = orderedFriends.length === limit ? skip + limit : null;

    return {
      data: orderedFriends,
      nextCursor: nextCursor,
    };
  }

  async findUserFriendsContextByUsername(
    username: string,
  ): Promise<UserFriendsContextResult | null> {
    return this.findOneLean<UserFriendsContextResult>(
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

  async areFriends(
    requestingUserId: string,
    profileUserId: string,
  ): Promise<boolean> {
    if (requestingUserId === profileUserId) {
      return false;
    }

    const requestingUser = await this.findUserWithFriend(
      requestingUserId,
      profileUserId,
    );

    return !!requestingUser;
  }
  async getAccount(
    userId: string,
  ): Promise<
    Pick<
      UserDocument,
      | 'privacySettings'
      | 'email'
      | 'phoneNumber'
      | 'birthDate'
      | 'gender'
      | 'firstName'
      | 'lastName'
      | 'username'
      | '_id'
    >
  > {
    return this.userModel
      .findById(new Types.ObjectId(userId))
      .select(
        'firstName lastName phoneNumber birthDate gender privacySettings email username',
      )
      .lean();
  }
  async updateAccount(
    userId: string,
    data: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(new Types.ObjectId(userId), data, { new: true })
      .select(
        'firstName lastName phoneNumber birthDate gender privacySettings email username',
      )
      .lean();
  }
}
