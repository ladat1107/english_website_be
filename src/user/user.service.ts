import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schemas';
import { Model } from 'mongoose';

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
      throw new NotFoundException('Lỗi khi tạo người dùng');
    }
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-refreshTokenHash').exec();
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
      throw new NotFoundException('Error in findOrCreateByGoogle');
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
      throw new NotFoundException('Error updating refresh token');
    }
  }


  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
