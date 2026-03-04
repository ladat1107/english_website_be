import { Injectable } from '@nestjs/common';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';
import { QueryClassSessionDto } from './dto/query-class-session';
import { JwtPayload } from '@/auth/auth.service';
import { UserRole } from '@/utils/constants/enum';
import dayjs from 'dayjs';
import { InjectModel } from '@nestjs/mongoose';
import { ClassSession } from './schemas/class-session.schemas';
import { Model, Types } from 'mongoose';
import { UsersService } from '@/user/user.service';
import { date } from 'joi';

@Injectable()
export class ClassSessionsService {

  constructor(
    @InjectModel(ClassSession.name)
    private readonly classSessionModel: Model<ClassSession>,
    private usersService: UsersService
  ) { }

  async create(createClassSessionDto: CreateClassSessionDto, user: JwtPayload) {
    try {
      const createdClassSession = await this.classSessionModel.create({
        ...createClassSessionDto,
        mentor_id: new Types.ObjectId(user._id),
      });

      return createdClassSession;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAll(query: QueryClassSessionDto, user: JwtPayload) {
    try {
      const { startDate, endDate } = query;

      const matchStages: any = {}

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate && endDate) {
        start = dayjs(startDate).startOf("day").toDate();
        end = dayjs(endDate).endOf("day").toDate();
      }

      if (user && user.role === UserRole.STUDENT) {
        matchStages.is_active = true;
      }

      if (start && end) {
        matchStages.date = {
          $gte: start,
          $lte: end
        };
      }

      const pipeline: any = [
        {
          $match: matchStages,
        }, {
          $lookup: {
            from: 'users',
            localField: 'mentor_id',
            foreignField: '_id',
            as: 'mentor'
          },
        }, {
          $unwind: '$mentor'
        }, {
          $lookup: {
            from: 'participants',
            localField: '_id',
            foreignField: 'class_session_id',
            as: 'participants'
          },
        }, {
          $unset: [
            'mentor.refreshTokenHash'
          ]
        }
      ];

      const classSessions = await this.classSessionModel.aggregate(pipeline);

      return classSessions;

    } catch (error) {
      console.error('Error fetching class sessions:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const pipeline: any = [
        {
          $match: {
            _id: new Types.ObjectId(id)
          }
        }, {
          $lookup: {
            from: 'users',
            localField: 'mentor_id',
            foreignField: '_id',
            as: 'mentor'
          },
        }, {
          $unwind: '$mentor'
        }, {
          $lookup: {
            from: 'participants',
            localField: '_id',
            foreignField: 'class_session_id',
            as: 'participants'
          },
        }, {
          $unset: [
            'mentor.refreshTokenHash'
          ]
        }
      ];

      const classSessions = await this.classSessionModel.aggregate(pipeline);

      const participantUserIds: string[] = [
        ...new Set(
          classSessions.flatMap(session =>
            (session.participants || []).map(p =>
              p.user_id.toString()
            )
          )
        )
      ]

      const users = await this.usersService.getUserByIds(participantUserIds);

      const classSessionsWithParticipants = classSessions.map((session: any) => {
        const participantsWithUserInfo = session.participants.map((participant: any) => {
          const userInfo = users.find((user: any) => user._id.toString() === participant.user_id.toString());
          return {
            ...participant,
            user: userInfo || null, // Thêm thông tin user vào participant
          };
        });

        return {
          ...session,
          participants: participantsWithUserInfo, // Cập nhật lại participants với thông tin user
        };
      });

      return classSessionsWithParticipants[0] || null;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const classSession = await this.classSessionModel.findById(new Types.ObjectId(id))
        .populate('mentor_id', '-refreshTokenHash')
        .lean();

      if (!classSession) {
        throw new Error('Không tìm thấy buổi học');
      }

      return classSession;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateClassSessionDto: UpdateClassSessionDto) {
    try {

      const updatedClassSession = await this.classSessionModel.findByIdAndUpdate(
        id,
        { $set: { ...updateClassSessionDto } },
        { new: true }
      );

      return updatedClassSession;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const deletedClassSession = await this.classSessionModel.findByIdAndDelete(id);

      return deletedClassSession;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findMyClassSessions(user: JwtPayload) {
    try {
      const pipeline: any = [
        {
          $match: {
            date: { $gte: dayjs().startOf('day').toDate() },
            is_active: true,
          }
        },
        {
          $lookup: {
            from: 'participants',
            localField: '_id',
            foreignField: 'class_session_id',
            as: 'participants'
          }
        }, {
          $match: {
            'participants.user_id': new Types.ObjectId(user._id)
          }
        }
      ]

      const classSessions = await this.classSessionModel.aggregate(pipeline);
      return classSessions;

    } catch (error) {
      console.error("Error finding my class sessions:", error);
      throw error;
    }
  }

}
