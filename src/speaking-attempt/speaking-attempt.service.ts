import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSpeakingAttemptDto } from './dto/create-speaking-attempt.dto';
import { UpdateSpeakingAttemptDto } from './dto/update-speaking-attempt.dto';
import { JwtPayload } from '@/auth/auth.service';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { SpeakingAnswerService } from '@/speaking-answer/speaking-answer.service';
import { SpeakingAttempt } from './schemas/speaking-attempt.schemas';
import { ExamAttemptStatus, UserRole } from '@/utils/constants/enum';
import dayjs from 'dayjs';

@Injectable()
export class SpeakingAttemptService {

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(SpeakingAttempt.name)
    private readonly speakingAttemptModel: Model<SpeakingAttempt>,
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


  findAll() {
    return `This action returns all speakingAttempt`;
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
            total_questions: { $size: "$answers" }
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
            total_questions: 1,
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
      // const attempt = await this.speakingAttemptModel.findOne({
      //   _id: new Types.ObjectId(attemptId),
      //   user_id: new Types.ObjectId(userId),
      // })
      //   .populate('exam_id')
      //   .lean();

      // if (!attempt) {
      //   throw new BadRequestException('Không tìm thấy bài làm');
      // }

      // const answers = await this.speakingAnswerService.findByAttemptId(attemptId);

      // // Tính điểm trung bình
      // const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
      // const avgScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;

      // return {
      //   attempt: {
      //     ...attempt,
      //     exam: attempt.exam_id,
      //   },
      //   answers,
      //   average_score: avgScore,
      // };

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

  findOne(id: number) {
    return `This action returns a #${id} speakingAttempt`;
  }

  update(id: number, updateSpeakingAttemptDto: UpdateSpeakingAttemptDto) {
    return `This action updates a #${id} speakingAttempt`;
  }

  remove(id: number) {
    return `This action removes a #${id} speakingAttempt`;
  }
}
