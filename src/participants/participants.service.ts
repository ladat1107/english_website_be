import { Injectable } from '@nestjs/common';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { JwtPayload } from '@/auth/auth.service';
import { RegistrationStatus, UserRole } from '@/utils/constants/enum';
import { InjectModel } from '@nestjs/mongoose';
import { Participant } from './schemas/participant.schemas';
import { Model, Types } from 'mongoose';
import { ClassSessionsService } from '@/class-sessions/class-sessions.service';
import dayjs from 'dayjs';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class ParticipantsService {

  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
    private classSessionsService: ClassSessionsService,
    private mailService: MailService
  ) { }

  async create(createParticipantDto: CreateParticipantDto, user: JwtPayload) {
    try {
      const { class_session_id } = createParticipantDto;
      if (user.role !== UserRole.STUDENT) {
        throw new Error('Chỉ tài khoản học sinh mới có thể đăng ký tham gia lớp học');
      }

      if (!class_session_id || !user._id) {
        throw new Error('Không đủ thông tin để đăng ký tham gia lớp học');
      }

      const classSession = await this.classSessionsService.findById(class_session_id);

      if (dayjs(classSession.date).isBefore(dayjs(), "day")) {
        throw new Error('Không thể đăng ký tham gia lớp học đã diễn ra');
      }

      const paticipantExist = await this.participantModel.findOne({
        class_session_id: new Types.ObjectId(class_session_id),
        user_id: new Types.ObjectId(user._id)
      });

      if (paticipantExist) {
        throw new Error('Bạn đã đăng ký tham gia lớp học này rồi');
      }



      const createdParticipant = await this.participantModel.create({
        class_session_id: new Types.ObjectId(class_session_id),
        user_id: new Types.ObjectId(user._id),
        status: RegistrationStatus.REGISTERED,
      });

      if (createdParticipant) {
        this.mailService.sendClassScheduleMail(user.email, {
          userName: user.full_name,
          title: classSession.title,
          description: classSession.description,
          date: dayjs(classSession.date).format('DD/MM/YYYY'),
          startTime: classSession.startTime,
          endTime: classSession.endTime,
          link: classSession.link,
        });
      }
      return createdParticipant;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAll() {
    return `This action returns all participants`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} participant`;
  }

  async update(id: string, updateParticipantDto: UpdateParticipantDto) {
    try {
      const paticipantUpdated = await this.participantModel.findByIdAndUpdate(id, {
        $set: { ...updateParticipantDto }
      }, { new: true });

      if (!paticipantUpdated) {
        throw new Error('Không tìm thấy đăng ký tham gia lớp học');
      }
      return paticipantUpdated;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, user: JwtPayload) {
    try {
      const deletedParticipant = await this.participantModel.findById(new Types.ObjectId(id));
      if (!deletedParticipant || deletedParticipant.user_id.toString() !== user._id) {
        throw new Error('Không thể hủy đăng ký tham gia lớp học này');
      }
      return await this.participantModel.findByIdAndDelete(new Types.ObjectId(deletedParticipant._id));
    } catch (error) {
      console.log("Error in remove participant:", error);
      throw error;
    }
  }
}
