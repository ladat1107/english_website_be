import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateSpeakingAttemptDto } from './dto/create-speaking-attempt.dto';
import { UpdateSpeakingAttemptDto } from './dto/update-speaking-attempt.dto';
import { QueryGradingListDto } from './dto/query-grading-list.dto';
import { JwtPayload } from '@/auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { SpeakingAnswerService } from '@/speaking-answer/speaking-answer.service';
import { SpeakingAttempt } from './schemas/speaking-attempt.schemas';
import { ExamAttemptStatus, UserRole } from '@/utils/constants/enum';
import dayjs from 'dayjs';
import { calculateSkip, createPaginatedResponse } from '@/common/dto/pagination.dto';
import { buildVietnameseRegex } from '@/utils/functions/function';
import console from 'node:console';

@Injectable()
export class SpeakingAttemptService {

  constructor(
    @InjectModel(SpeakingAttempt.name)

    private readonly speakingAttemptModel: Model<SpeakingAttempt>,

    @Inject(forwardRef(() => SpeakingAnswerService))
    private speakingAnswerService: SpeakingAnswerService,
  ) { }

  async create(createSpeakingAttemptDto: CreateSpeakingAttemptDto, user: JwtPayload) {
    try {
      const { exam_id } = createSpeakingAttemptDto;
      const user_id = user._id;
      if (!exam_id || !user_id) {
        throw new BadRequestException('Thiếu thông tin bắt buộc hoặc người dùng không có quyền thực hiện hành động này');
      }

      if (user.role !== UserRole.STUDENT) {
        throw new BadRequestException('Chỉ học sinh mới có thể làm bài luyện');
      }

      const existingAttempt = await this.speakingAttemptModel.findOne({
        exam_id: new Types.ObjectId(exam_id),
        user_id: new Types.ObjectId(user_id),
        status: { $in: [ExamAttemptStatus.IN_PROGRESS, ExamAttemptStatus.NOT_STARTED] },
      }).lean();

      if (existingAttempt) {
        const answers = await this.speakingAnswerService.findByAttemptId(existingAttempt._id.toString());
        return {
          attempt: existingAttempt,
          answers: answers || [],
          is_resumed: true
        };
      }

      // Nếu không có bài đang dở, tạo mới
      const newAttempt = await this.speakingAttemptModel.create({
        user_id: new Types.ObjectId(user_id),
        exam_id: new Types.ObjectId(exam_id),
        status: ExamAttemptStatus.IN_PROGRESS,
        started_at: dayjs()
      });

      return {
        attempt: newAttempt.toObject(),
        answers: [],
        is_resumed: false
      };

    } catch (error) {
      console.error('Error creating speaking attempt:', error);
      throw error;
    }
  }

  async submitAttempt(attemptId: string, userId: string) {
    try {
      const attempt = await this.speakingAttemptModel.findOneAndUpdate({
        _id: new Types.ObjectId(attemptId),
        user_id: new Types.ObjectId(userId)
      }, {
        status: ExamAttemptStatus.COMPLETED,
        submitted_at: dayjs()
      }, { new: true }
      );

      return attempt;
    } catch (error) {
      console.error(`Error submitting attempt ${attemptId}:`, error);
      throw error;
    }
  }


  /**
   * Lấy lịch sử làm bài của user cho một exam cụ thể
   */
  async findHistoryByExamId(examId: string, userId: string) {
    try {

      const attempts = await this.speakingAttemptModel.aggregate([
        {
          $match: {
            exam_id: new Types.ObjectId(examId),
            user_id: new Types.ObjectId(userId),
            status: ExamAttemptStatus.COMPLETED,
          }
        }, {
          $lookup: {
            from: "speakingexams",
            localField: "exam_id",
            foreignField: "_id",
            as: "exam_id",
          },
        }, {
          $unwind: "$exam_id"
        }, {
          $lookup: {
            from: "speakinganswers",
            localField: "_id",
            foreignField: "attempt_id",
            as: "answers"
          }
        }, {
          $addFields: {
            // Sort answers by question_number
            answers: {
              $sortArray: {
                input: "$answers",
                sortBy: { "question.question_number": 1 }
              }
            },
            // Calculate average score
            average_score: {
              $cond: [
                { $gt: [{ $size: "$answers" }, 0] },
                { $round: [{ $avg: "$answers.score" }, 0] },
                0
              ]
            },
            // Count answered questions
            answered_count: {
              $size: {
                $filter: {
                  input: "$answers",
                  cond: { $ne: ["$$this.audio_url", null] }
                }
              }
            },
          }
        },
        {
          $project: {
            _id: 1,
            exam_id: "$exam_id._id",
            exam: "$exam_id",
            user_id: 1,
            status: 1,
            started_at: 1,
            submitted_at: 1,
            average_score: 1,
            answered_count: 1,
          }
        }, {
          $sort: { createdAt: -1 }
        }
      ])
      if (!attempts || attempts.length === 0) {
        return [];
      }

      return attempts;
    } catch (error) {
      console.error('Error finding history by exam ID:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết một lần làm bài với answers
   */
  async findDetailById(attemptId: string, userId: string) {
    try {
      const attempt = await this.speakingAttemptModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(attemptId),
            user_id: new Types.ObjectId(userId),
            status: ExamAttemptStatus.COMPLETED,
          }
        },
        {
          $lookup: {
            from: "speakingexams",
            localField: "exam_id",
            foreignField: "_id",
            as: "exam",
          },
        }, {
          $unwind: "$exam"
        }, {
          $lookup: {
            from: "speakinganswers",
            localField: "_id",
            foreignField: "attempt_id",
            as: "answers"
          }
        }, {
          $addFields: {
            average_score: {
              $cond: [   // $cound điều kiện luôn có if -> then -> else
                { $gt: [{ $size: "$answers" }, 0] },  // gt: so sánh lớn hơn, size: đếm số phần tử trong mảng answers 
                { $round: [{ $avg: "$answers.score" }, 0] },
                0
              ]
            }
          }
        }
      ])
      if (!attempt || attempt.length === 0) {
        throw new BadRequestException('Không tìm thấy bài làm');
      }
      return {
        attempt: attempt[0],
        average_score: attempt[0].average_score || 0,
      }
    } catch (error) {
      console.error('Error finding detail by ID:', error);
      throw error;
    }
  }

  async findAll(query: QueryGradingListDto) {
    const { page = 1, limit = 10, search, topic, has_teacher_feedback } = query;

    const matchStage: any = {
      status: ExamAttemptStatus.COMPLETED,
    };

    if (has_teacher_feedback !== undefined) {
      matchStage.has_teacher_feedback = has_teacher_feedback;
    }

    const searchStage = search ? {
      $or: [
        { 'user.full_name': { $regex: buildVietnameseRegex(search), $options: 'i' } },
        { 'user.email': { $regex: buildVietnameseRegex(search), $options: 'i' } },
        { 'exam.title': { $regex: buildVietnameseRegex(search), $options: 'i' } },
      ]
    } : {};

    const piline: any = [{
      $match: matchStage,
    }, {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',
      }
    }, {
      $unwind: '$user'
    }, {
      $lookup: {
        from: 'speakingexams',
        localField: 'exam_id',
        foreignField: '_id',
        as: 'exam',
      }
    }, {
      $unwind: '$exam'
    },
    ...search ? [{ $match: searchStage }] : [],
    ...topic ? [{ $match: { 'exam.topic': topic } }] : [],
    {
      $sort: { submitted_at: -1 },
    }, {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: calculateSkip(page, limit) },
          { $limit: limit },
          {
            $lookup: {
              from: 'speakinganswers',
              localField: '_id',
              foreignField: 'attempt_id',
              as: 'answers',
            }
          },
          {
            $addFields: {
              average_score: {
                $cond: [
                  { $gt: [{ $size: '$answers' }, 0] },
                  { $round: [{ $avg: '$answers.score' }, 0] },
                  0
                ],
              },
            }
          }
        ]
      }
    }, {
      $project: {
        items: "$data",
        totalItems: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] }, // arrayElemAt để lấy phần tử đầu tiên của mảng metadata
      }
    }
    ];

    const result = await this.speakingAttemptModel.aggregate(piline);

    return createPaginatedResponse(result[0].items, result[0].totalItems, page, limit);
  }

  async findOne(attemptId: string) {
    try {
      const attempt = await this.speakingAttemptModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(attemptId),
            status: ExamAttemptStatus.COMPLETED,
          }
        },
        // Lookup user
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  email: 1,
                  full_name: 1,
                  avatar_url: 1,
                }
              }
            ]
          }
        },
        { $unwind: '$user' },
        // Lookup exam
        {
          $lookup: {
            from: 'speakingexams',
            localField: 'exam_id',
            foreignField: '_id',
            as: 'exam',
          }
        },
        { $unwind: '$exam' },
        // Lookup answers
        {
          $lookup: {
            from: 'speakinganswers',
            localField: '_id',
            foreignField: 'attempt_id',
            as: 'answers',
          }
        },
        {
          $addFields: {
            answers: {
              $sortArray: {
                input: '$answers',
                sortBy: { 'question.question_number': 1 }
              }
            },
            average_score: {
              $cond: [
                { $gt: [{ $size: '$answers' }, 0] },
                { $round: [{ $avg: '$answers.score' }, 0] },
                0
              ]
            }
          }
        }
      ]);

      if (!attempt || attempt.length === 0) {
        throw new BadRequestException('Không tìm thấy bài làm');
      }

      const attemptData = attempt[0];
      return attemptData;
    } catch (error) {
      console.error('Error finding detail for grading:', error);
      throw error;
    }
  }

  async update(id: string, updateSpeakingAttemptDto: UpdateSpeakingAttemptDto) {
    try {
      console.log("Updating speaking attempt", updateSpeakingAttemptDto.has_teacher_feedback);
      if (updateSpeakingAttemptDto.multiple_choice_answers && updateSpeakingAttemptDto.multiple_choice_answers.length > 0) {
        console.log("lala ", updateSpeakingAttemptDto.multiple_choice_answers);
      }
      const updatedAttempt = await this.speakingAttemptModel.findByIdAndUpdate(id, {
        $set: {
          ...updateSpeakingAttemptDto
        }
      }, { new: true });

      if (!updatedAttempt) {
        throw new BadRequestException('Không tìm thấy bài làm');
      }

      return updatedAttempt;
    } catch (error) {
      console.error(`Error updating speaking attempt ${id}:`, error);
      throw error;
    }
    return `This action updates a #${id} speakingAttempt`;
  }

  async remove(id: string) {
    return `This action removes a #${id} speakingAttempt`;
  }
  async removeByExamId(examId: string, session?: ClientSession) {
    try {
      const attempts = await this.speakingAttemptModel
        .find({ exam_id: new Types.ObjectId(examId) })
        .session(session || null);

      const attemptIds = attempts.map((a) => a._id);

      // gọi service khác
      await this.speakingAnswerService.removeByAttemptIds(
        attemptIds,
        session,
      );

      await this.speakingAttemptModel
        .deleteMany({ exam_id: new Types.ObjectId(examId) })
        .session(session || null);
    } catch (error) {
      console.error(`Error removing speaking attempts for exam ${examId}:`, error);
      throw error;
    }
  }
}
