import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, PipelineStage } from 'mongoose';
import {
  BaseQueryOptions,
  BaseRepository,
} from 'src/share/base-class/base-repository.service';
import { UserDocument } from 'src/schemas';
import {
  UserMinimalWithEmailModel,
  UserFriendsContextResult,
  UserProfileModel,
  CreateUserData,
  SuggestedFriendData,
  SuggestedFriendResult,
  UserMinimalModel,
} from './interfaces';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
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
  async findKeyVaultAndUserBasicById(
    userId: string,
  ): Promise<Pick<
    UserDocument,
    'keyVault' | 'username' | 'avatar' | 'firstName' | 'lastName' | '_id'
  > | null> {
    return this.findOneLean(
      { _id: new Types.ObjectId(userId) },
      { projection: 'keyVault username avatar firstName lastName _id' },
    );
  }
  async findProfileByUsername(
    username: string,
  ): Promise<UserProfileModel<Types.ObjectId> | null> {
    return this.findOneLean(
      { username },
      {
        projection:
          'firstName lastName username avatar coverPhoto ' +
          'privacySettings friendCount bio work currentLocation provinceCode',
      },
    );
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
  async findFriendSuggestions({
    provinceCode,
    detectedCity,
    limit,
    cursor,
    mutualFriendIds = [],
    excludeIds = [],
  }: SuggestedFriendData): Promise<SuggestedFriendResult> {
    const pipeline: PipelineStage[] = [];

    const mutualFriendObjIds = mutualFriendIds.map(
      (id) => new Types.ObjectId(id),
    );

    pipeline.push({
      $match: {
        _id: { $nin: excludeIds.map((id) => new Types.ObjectId(id)) },
        isVerified: true,
      },
    });

    pipeline.push({
      $addFields: {
        isMutualFriend: { $in: ['$_id', mutualFriendObjIds] },
        isSameProvince: {
          $and: [
            { $ne: [provinceCode, null] },
            { $eq: ['$provinceCode', provinceCode] },
          ],
        },
        isSameDetectedCity: {
          $and: [
            { $ne: [detectedCity, null] },
            { $eq: ['$detectedCity', detectedCity] },
          ],
        },
      },
    });

    pipeline.push({
      $addFields: {
        suggestionScore: {
          $add: [
            { $cond: ['$isSameProvince', 10, 0] },
            { $cond: ['$isMutualFriend', 7, 0] },
            { $cond: ['$isSameDetectedCity', 5, 0] },
          ],
        },
      },
    });

    if (cursor) {
      pipeline.push({
        $match: {
          $or: [
            { suggestionScore: { $lt: cursor.lastScore } },
            {
              $and: [
                { suggestionScore: { $eq: cursor.lastScore } },
                { _id: { $lt: new Types.ObjectId(cursor.lastId) } },
              ],
            },
          ],
        },
      });
    }

    pipeline.push({
      $sort: {
        suggestionScore: -1,
        _id: -1,
      },
    });

    pipeline.push({ $limit: limit });
    pipeline.push({
      $project: {
        firstName: 1,
        lastName: 1,
        username: 1,
        avatar: 1,
        suggestionScore: 1,
      },
    });

    return this.model.aggregate(pipeline);
  }

  async getUsernameById(id: string): Promise<{
    username: string;
    _id: Types.ObjectId;
  } | null> {
    return this.model.findById(id, { username: 1 }).lean() as any;
  }

  async searchUsers(
    query: string,
    limit: number,
    cursor?: string,
    excludeIds: string[] = [],
  ): Promise<UserDocument[]> {
    const pipeline: PipelineStage[] = [];

    pipeline.push({
      $match: {
        _id: { $nin: excludeIds.map((id) => new Types.ObjectId(id)) },
      },
    });

    pipeline.push({
      $match: {
        $expr: {
          $or: [
            {
              $regexMatch: {
                input: '$firstName',
                regex: query,
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: '$lastName',
                regex: query,
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: '$username',
                regex: query,
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: { $concat: ['$firstName', ' ', '$lastName'] },
                regex: query,
                options: 'i',
              },
            },
          ],
        },
      },
    });

    if (cursor) {
      pipeline.push({
        $match: {
          _id: { $lt: new Types.ObjectId(cursor) },
        },
      });
    }

    pipeline.push({ $sort: { _id: -1 } });
    pipeline.push({ $limit: limit });

    return this.model.aggregate(pipeline);
  }

  async findManyByIdsAndSearch(
    ids: string[],
    query: string,
    limit: number,
    cursor?: string,
  ): Promise<UserMinimalModel<Types.ObjectId>[]> {
    const pipeline: PipelineStage[] = [];

    pipeline.push({
      $match: {
        _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
      },
    });

    pipeline.push({
      $match: {
        $expr: {
          $or: [
            {
              $regexMatch: {
                input: '$firstName',
                regex: query,
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: '$lastName',
                regex: query,
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: '$username',
                regex: query,
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: { $concat: ['$firstName', ' ', '$lastName'] },
                regex: query,
                options: 'i',
              },
            },
          ],
        },
      },
    });

    if (cursor) {
      pipeline.push({
        $match: {
          _id: { $lt: new Types.ObjectId(cursor) },
        },
      });
    }

    pipeline.push({ $sort: { _id: -1 } });
    pipeline.push({ $limit: limit });
    pipeline.push({
      $project: {
        firstName: 1,
        lastName: 1,
        username: 1,
        avatar: 1,
      },
    });

    return this.model.aggregate(pipeline);
  }
  async updateLastActive(userId: string, lastActiveAt: Date): Promise<void> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $set: { lastActiveAt } },
    );
  }
}
