import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { UserDocument } from 'src/schemas/user.schema';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { PaginatedResponse } from 'src/share/dto/pagination.dto';
import { UserRole } from 'src/share/enums/user-role.enum';

export type GetUsersInput = {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
  isVerified?: boolean;
  isDeleted?: boolean;
};

export type UserListItem = {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: any;
  role: string;
  status: string;
  isVerified: boolean;
  createdAt: Date;
  deletedAt?: Date;
};

export type GetUsersOutput = PaginatedResponse<UserListItem>;

@Injectable()
export class GetUsersService extends BaseUseCaseService<
  GetUsersInput,
  GetUsersOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(input: GetUsersInput): Promise<GetUsersOutput> {
    const { page, limit, search, role, status, isVerified, isDeleted } = input;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<UserDocument> = {};

    filter.role = { $ne: UserRole.ADMIN };

    if (isDeleted) {
      filter.deletedAt = { $ne: null };
    }
    if (status) {
      filter.status = status;
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified;
    }

    if (search) {
      const searchConditions: any[] = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];

      if (Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: new Types.ObjectId(search) });
      }

      filter.$or = searchConditions;
    }

    const [users, total] = await Promise.all([
      this.userRepository.findLeaned<UserDocument>(filter, {
        projection:
          '_id username email firstName lastName avatar role status isVerified createdAt deletedAt',
        sort: { createdAt: -1 },
        skip,
        limit,
      }),
      this.userRepository.count(filter),
    ]);

    return {
      data: users.map((user) => ({
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        deletedAt: user.deletedAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
