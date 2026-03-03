import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schemas';
import { Model } from 'mongoose';
import { QueryUserDto } from './dto/query-user.dto';
import { calculateSkip, createPaginatedResponse } from '@/common/dto/pagination.dto';
import { buildVietnameseRegex } from '@/utils/functions/function';
import { JwtPayload } from '@/auth/auth.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) { }

  create(createUserDto: CreateUserDto) {
    try {
      const createdUser = new this.userModel(createUserDto);
      return createdUser.save();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Lỗi khi tạo người dùng');
    }
  }

  async findAll(queryUserDto: QueryUserDto) {
    try {
      const { page = 1, limit = 10, search, role, current_level } = queryUserDto;
      const matchStage: any = {};
      if (role) {
        matchStage.role = role;
      }
      if (current_level) {
        matchStage.current_level = current_level;
      }

      const searchStage = search ? {
        $or: [
          { 'full_name': { $regex: buildVietnameseRegex(search), $options: 'i' } },
          { 'email': { $regex: buildVietnameseRegex(search), $options: 'i' } },
        ]
      } : {};

      const piline: any = [{
        $match: { ...matchStage, ...searchStage },
      }, {
        $sort: { createdAt: -1 },
      }, {
        $facet: {
          metadata: [{ $count: "total" }],
          byRole: [{
            $group: {
              _id: "$role",
              count: { $sum: 1 }
            }
          }, {
            $project: {
              _id: 0,
              role: "$_id",
              count: 1
            }
          }],
          data: [{ $skip: calculateSkip(page, limit) }, { $limit: limit }]
        }
      }, {
        $unwind: {
          path: "$metadata",
          preserveNullAndEmptyArrays: true
        }
      }, {
        $project: {
          total: "$metadata.total",
          data: 1,
          statsByRole: "$byRole"
        }
      }]

      const result = await this.userModel.aggregate(piline);

      if (!result || result.length === 0) {
        return createPaginatedResponse([], 0, page, limit);
      }

      return createPaginatedResponse(result[0].data, result[0].total, page, limit, result[0].statsByRole);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findOrCreateByGoogle(googleUser: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    try {
      const { googleId, email, name, avatar } = googleUser;
      let user = await this.userModel.findOne({ googleId }).exec();

      if (!user) {
        user = new this.userModel({
          googleId,
          email,
          full_name: name,
          avatar_url: avatar,
        });
      }

      user.avatar_url = avatar ?? user.avatar_url;
      //user.lastLoginAt = new Date();

      await user.save();

      return user;

    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error in findOrCreateByGoogle');
    }
  }

  async findByGoogleId(googleId: string) {
    try {
      const user = await this.userModel.findOne({ googleId }).exec();
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: refreshTokenHash });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error updating refresh token');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, {
        $set: updateUserDto,
      }, { new: true }).exec();

      if (!updatedUser) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      return updatedUser;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

      if (!deletedUser) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      return deletedUser;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getUserByIds(userIds: string[]) {
    try {
      const users = await this.userModel.find({ _id: { $in: userIds } }).exec();
      return users;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: JwtPayload) {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(user._id, {
        $set: { ...updateProfileDto },
      }, { new: true }).exec();
      if (!updatedUser) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      return updatedUser;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
