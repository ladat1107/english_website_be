import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSpeakingAttemptDto } from './dto/create-speaking-attempt.dto';
import { UpdateSpeakingAttemptDto } from './dto/update-speaking-attempt.dto';
import { JwtPayload } from '@/auth/auth.service';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
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
    const session = await this.connection.startSession();
    try {
      const { exam_id, started_at, answers } = createSpeakingAttemptDto;
      const user_id = user._id;
      if (!exam_id || !started_at || !answers || answers.length === 0 || !user_id || user.role !== UserRole.STUDENT) {
        throw new BadRequestException('Thiếu thông tin bắt buộc hoặc người dùng không có quyền thực hiện hành động này');
      }

      session.startTransaction();
      const createdSpeakingAttempt = await this.speakingAttemptModel.create([{
        exam_id,
        user_id,
        started_at,
        status: ExamAttemptStatus.COMPLETED,
        submitted_at: dayjs().toISOString(),
      }], { session });

      const speakingAttemptId = createdSpeakingAttempt[0]._id;
      const createSpeakingAnswerDtos = answers.map(answer => ({
        ...answer,
        attempt_id: speakingAttemptId,
      }));

      const createSpeakingAnswer = await this.speakingAnswerService.bulkCreate(createSpeakingAnswerDtos, session);

      await session.commitTransaction();
      return { speakingAttempt: createdSpeakingAttempt[0], speakingAnswers: createSpeakingAnswer };
    } catch (error) {
      console.error('Error creating speaking attempt:', error);
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }
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
