import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSpeakingExamDto } from './dto/create-speaking-exam.dto';
import { UpdateSpeakingExamDto } from './dto/update-speaking-exam.dto';
import { JwtPayload } from '@/auth/auth.service';
import { Model, Types } from 'mongoose';
import { SpeakingExam, SpeakingExamDocument } from './schemas/speaking-exam.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { QuerySpeakingExamDto } from './dto/query-speaking-exam';
import { calculateSkip, createPaginatedResponse } from '@/common/dto/pagination.dto';
import { UserRole } from '@/utils/constants/enum';
import { buildVietnameseRegex } from '@/utils/functions/function';

@Injectable()
export class SpeakingExamService {

  constructor(
    @InjectModel(SpeakingExam.name)
    private readonly speakingExamModel: Model<SpeakingExamDocument>,
  ) { }

  async create(createSpeakingExamDto: CreateSpeakingExamDto, user: JwtPayload) {
    try {
      const createdSpeakingExam = new this.speakingExamModel({
        ...createSpeakingExamDto,
        is_published: false,
        created_by: new Types.ObjectId(user._id),
      });
      return await createdSpeakingExam.save();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Lỗi khi tạo đề giao tiếp');
    }
  }

  async findAll(query: QuerySpeakingExamDto, user: JwtPayload) {
    const { page = 1, limit = 10, search, topic, is_published } = query;

    const filter: any = {};

    if (topic) {
      filter.topic = topic;
    }
    if (is_published !== undefined) {
      filter.is_published = is_published;
    }

    if (user && user.role !== UserRole.ADMIN) {
      filter.is_published = true;
    }

    if (search) {
      const regexString = buildVietnameseRegex(search);
      const regex = new RegExp(regexString, "i");
      filter.$or = [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }

    const skip = calculateSkip(page, limit);

    const [items, totalItems] = await Promise.all([
      this.speakingExamModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.speakingExamModel.countDocuments(filter).exec(),
    ])

    return createPaginatedResponse(items, totalItems, page, limit);

  }

  async findOne(id: string) {
    try {
      const speakingExam = await this.speakingExamModel.findById(id);
      if (!speakingExam) {
        throw new NotFoundException('Đề giao tiếp không tồn tại');
      }
      return speakingExam;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateSpeakingExamDto: UpdateSpeakingExamDto) {
    try {

      const updatedSpeakingExam = await this.speakingExamModel.findByIdAndUpdate(
        id,
        { $set: updateSpeakingExamDto },
        { new: true, runValidators: true },
      );

      if (!updatedSpeakingExam) {
        throw new NotFoundException('Đề giao tiếp không tồn tại');
      }
      return updatedSpeakingExam;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    const speakingExam = await this.speakingExamModel.findByIdAndDelete(id);
    if (!speakingExam) {
      throw new NotFoundException('Đề giao tiếp không tồn tại');
    }
    return speakingExam;
  }
}
