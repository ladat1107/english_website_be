import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateWritingExamDto } from './dto/create-writing-exam.dto';
import { UpdateWritingExamDto } from './dto/update-writing-exam.dto';
import { InjectModel } from '@nestjs/mongoose';
import { WritingExam, WritingExamDocument } from './schemas/writing-exam.schemas';
import { Model, Types } from 'mongoose';
import { JwtPayload } from '@/auth/auth.service';
import { QueryWritingExamDto } from './dto/query-writing-exam.dto';
import { calculateSkip, createPaginatedResponse } from '@/common/dto/pagination.dto';
import { UserRole } from '@/utils/constants/enum';
import { buildVietnameseRegex } from '@/utils/functions/function';
import { WritingAnswerService } from '@/writing-answer/writing-answer.service';

@Injectable()
export class WritingExamService {
  constructor(
    @InjectModel(WritingExam.name)
    private readonly writingExamModel: Model<WritingExamDocument>,

    @Inject(forwardRef(() => WritingAnswerService))
    private writingAnswerService: WritingAnswerService,
  ) { }

  async create(createWritingExamDto: CreateWritingExamDto, user: JwtPayload) {
    try {
      const createdWritingExam = await this.writingExamModel.create({
        ...createWritingExamDto,
        is_published: createWritingExamDto.is_published ?? false,
        created_by: new Types.ObjectId(user._id),
      });
      return createdWritingExam;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Lỗi khi tạo đề luyện viết');
    }
  }

  async findAll(query: QueryWritingExamDto, user: JwtPayload) {
    const { page = 1, limit = 10, search, is_published, type, level } = query;

    const filter: any = {};

    if (is_published !== undefined) { filter.is_published = is_published; }

    if (type) { filter.type = type; }

    if (level) { filter.level = level; }


    // Non-admin users can only see published exams
    if (!user || user.role !== UserRole.ADMIN) {
      filter.is_published = true;
    }

    if (search) {
      const regexString = buildVietnameseRegex(search);
      const regex = new RegExp(regexString, "i");
      filter.$or = [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
      ];
    }

    const skip = calculateSkip(page, limit);

    const [items, totalItems] = await Promise.all([
      this.writingExamModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.writingExamModel.countDocuments(filter).exec(),
    ]);

    return createPaginatedResponse(items, totalItems, page, limit);
  }

  async findOne(id: string) {
    try {
      const writingExam = await this.writingExamModel.findById(id);
      if (!writingExam) {
        throw new NotFoundException('Đề luyện viết không tồn tại');
      }
      return writingExam;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateWritingExamDto: UpdateWritingExamDto) {
    try {
      const updatedWritingExam = await this.writingExamModel.findByIdAndUpdate(
        id,
        { $set: updateWritingExamDto },
        { new: true, runValidators: true },
      );

      if (!updatedWritingExam) {
        throw new NotFoundException('Đề luyện viết không tồn tại');
      }
      return updatedWritingExam;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    const session = await this.writingExamModel.db.startSession();
    session.startTransaction();
    try {
      const exam = await this.writingExamModel.findByIdAndDelete(id, { session });

      if (!exam) {
        throw new NotFoundException('Đề luyện viết không tồn tại');
      }

      await this.writingAnswerService.removeByExamId(id, session);

      await session.commitTransaction();

      return exam;
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findPublicSeo() {
    try {
      const exams = await this.writingExamModel
        .find({ is_published: true })
        .select("_id title type updatedAt")
        .exec();
      return exams;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đề luyện viết public SEO:", error);
      throw error;
    }
  }
}
