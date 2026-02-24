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
    const attempt = await this.speakingAttemptModel.findOneAndUpdate({
      _id: attemptId,
      user_id: userId
    }, {
      status: ExamAttemptStatus.COMPLETED,
      completed_at: dayjs()
    }, { new: true }
    );

    return attempt;
  }


  findAll() {
    return `This action returns all speakingAttempt`;
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
