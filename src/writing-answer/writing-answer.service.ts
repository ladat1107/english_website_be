import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWritingAnswerDto } from './dto/create-writing-answer.dto';
import { UpdateWritingAnswerDto } from './dto/update-writing-answer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { WritingAnswer, WritingAnswerDocument } from './schemas/writing-answer.schemas';
import { Model, Types } from 'mongoose';
import { JwtPayload } from '@/auth/auth.service';
import { QueryWritingAnswerDto } from './dto/query-writing-answer.dto';
import { calculateSkip, createPaginatedResponse } from '@/common/dto/pagination.dto';
import { AIAnalysisService } from '@/groq/ai-analysis.service';
import dayjs from 'dayjs';
import { buildVietnameseRegex } from '@/utils/functions/function';
import { WritingExamService } from '@/writing-exam/writing-exam.service';

@Injectable()
export class WritingAnswerService {
  constructor(
    @InjectModel(WritingAnswer.name)
    private readonly writingAnswerModel: Model<WritingAnswerDocument>,
    private aiAnalysisService: AIAnalysisService,
    
    @Inject(forwardRef(() => WritingExamService))
    private writingExamService: WritingExamService
  ) { }

  async create(createWritingAnswerDto: CreateWritingAnswerDto, user: JwtPayload) {
    const { writing_exam_id, answer, files } = createWritingAnswerDto;

    const writingExam = await this.writingExamService.findOne(writing_exam_id);

    const newAnswer = await this.writingAnswerModel.create({
      user_id: new Types.ObjectId(user._id),
      writing_exam_id: new Types.ObjectId(writing_exam_id),
      answer: answer || '',
      files: files || [],
      submitted_at: dayjs().toDate(),
    });

    // Process AI analysis asynchronously if there's text content
    if (answer && answer.trim().length > 0 && writingExam) {
      this.processWritingAnalysis(newAnswer._id.toString(), answer, writingExam.content)
        .catch(err => {
          console.error('Error processing writing analysis:', err);
        });
    }

    return newAnswer;
  }

  /**
   * Xử lý phân tích bài viết bằng AI
   */
  private async processWritingAnalysis(answerId: string, answerText: string, questionText: string): Promise<void> {
    try {

      const analysis = await this.aiAnalysisService.analysisWritingAnswer(answerText, questionText);

      await this.writingAnswerModel.findByIdAndUpdate(answerId, {
        $set: {
          ai_analysis: {
            // transcript: analysis.transcript,
            improvement: analysis.improvement,
            error: analysis.error,
            ai_fix: analysis.ai_fix
          },
          score: analysis.score
        }
      });
    } catch (error) {
      console.error(`[${answerId}] Error in writing analysis:`, error);
    }
  }

  async updateAIAnalysis(id: string) {
    const answer = await this.writingAnswerModel.findById(id).populate('writing_exam_id', 'content');

    const questionText = (answer?.writing_exam_id as any)?.content || 'N/A';

    if (!answer) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    if (!answer.answer || answer.answer.trim().length === 0) {
      throw new Error('Bài viết không có nội dung để phân tích');
    }

    if (answer && answer.ai_analysis)
      await this.processWritingAnalysis(id, answer.answer, questionText);

    return { message: 'AI analysis updated successfully' };
  }

  async findAll(query: QueryWritingAnswerDto, user?: JwtPayload) {
    try {
      const { page = 1, limit = 10, search, writing_exam_id, is_pinned } = query;
      const matchStage: any = {};

      if (writing_exam_id) matchStage.writing_exam_id = new Types.ObjectId(writing_exam_id);

      if (is_pinned !== undefined) matchStage.is_pinned = is_pinned;

      const buildSearchStage = search ? buildVietnameseRegex(search) : null;
      const searchStage = buildSearchStage ? {
        $or: [
          { 'user.full_name': { $regex: buildSearchStage, $options: 'i' } },
          { 'user.email': { $regex: buildSearchStage, $options: 'i' } },
          { 'exam.title': { $regex: buildSearchStage, $options: 'i' } },
          { 'exam.content': { $regex: buildSearchStage, $options: 'i' } },
        ]
      } : null;

      const aggregatePipeline: any = [{
        $match: matchStage
      }, {
        $lookup: {
          from: 'users',
          let: { userId: '$user_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            { $project: { full_name: 1, email: 1, avatar_url: 1, phone: 1, _id: 1 } }
          ],
          as: 'user'
        }
      }, {
        $unwind: '$user'
      }, {
        $lookup: {
          from: 'writingexams',
          localField: 'writing_exam_id',
          foreignField: '_id',
          as: 'writingexam'
        }
      }, {
        $unwind: '$writingexam'
      },
      ...searchStage ? [{ $match: searchStage }] : [],
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: calculateSkip(page, limit) },
            { $limit: limit }
          ]
        }
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$metadata.total", 0] }
        }
      }
      ];

      const result = await this.writingAnswerModel.aggregate(aggregatePipeline).exec();

      if (!result || result.length === 0) {
        return createPaginatedResponse([], 0, page, limit);
      }

      return createPaginatedResponse(result[0].data, result[0].total || 0, page, limit);
    } catch (error) {
      console.error("Error fetching writing answers:", error);
      throw error;
    }
  }

  async findByExamId(examId: string, userId?: string) {
    const filter: any = {
      writing_exam_id: new Types.ObjectId(examId),
    };

    if (userId) {
      filter.user_id = new Types.ObjectId(userId);
    }

    return this.writingAnswerModel
      .find(filter)
      .populate('user_id', 'full_name email avatar_url')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPinnedByExamId(examId: string) {
    const pinnedAnswers = await this.writingAnswerModel
      .find({
        writing_exam_id: new Types.ObjectId(examId),
        is_pinned: true,
      })
      .populate('user_id', 'full_name email avatar_url')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const result = pinnedAnswers.map((item) => ({
      ...item,
      user: item.user_id,
      user_id: undefined,   // optional: xóa field này
    }));

    return result;
  }

  async findUserHistory(examId: string, userId: string) {
    return this.writingAnswerModel
      .find({
        writing_exam_id: new Types.ObjectId(examId),
        user_id: new Types.ObjectId(userId),
      })
      .sort({ submitted_at: -1 })
      .lean()
      .exec();
  }

  async findOne(id: string) {
    const answer = await this.writingAnswerModel
      .findById(id)
      .populate('user_id', 'full_name email avatar_url')
      .populate('writing_exam_id', 'title content type images');

    if (!answer) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return {
      ...answer.toObject(),
      user: answer.user_id,
      writingexam: answer.writing_exam_id
    };
  }

  async update(id: string, updateWritingAnswerDto: UpdateWritingAnswerDto) {
    const updatedAnswer = await this.writingAnswerModel.findByIdAndUpdate(
      id,
      { $set: updateWritingAnswerDto },
      { new: true, runValidators: true }
    );

    if (!updatedAnswer) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return updatedAnswer;
  }

  async togglePin(id: string) {
    const answer = await this.writingAnswerModel.findById(id);

    if (!answer) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    answer.is_pinned = !answer.is_pinned;
    return answer.save();
  }

  async remove(id: string) {
    const deletedAnswer = await this.writingAnswerModel.findByIdAndDelete(id);

    if (!deletedAnswer) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return deletedAnswer;
  }

  async removeByExamId(examId: string, session?: any): Promise<any> {
    return this.writingAnswerModel.deleteMany({
      writing_exam_id: new Types.ObjectId(examId)
    }, { session });
  }
}
