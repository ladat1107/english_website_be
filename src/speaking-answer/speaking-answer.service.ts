import { Injectable } from '@nestjs/common';
import { CreateSpeakingAnswerDto } from './dto/create-speaking-answer.dto';
import { UpdateSpeakingAnswerDto } from './dto/update-speaking-answer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SpeakingAnswer } from './schemas/speaking-answer.schemas';
import { Model } from 'mongoose';

@Injectable()
export class SpeakingAnswerService {

  constructor(
    @InjectModel(SpeakingAnswer.name)
    private readonly speakingAnswerModel: Model<SpeakingAnswer>,
  ) { }
  create(createSpeakingAnswerDto: CreateSpeakingAnswerDto) {
    return 'This action adds a new speakingAnswer';
  }

  async bulkCreate(createSpeakingAnswerDtos: CreateSpeakingAnswerDto[], session: any) {
    try {
      const createdSpeakingAnswers = await this.speakingAnswerModel.insertMany(createSpeakingAnswerDtos, { session });
      return createdSpeakingAnswers;
    } catch (error) {
      console.error('Error in bulkCreate:', error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all speakingAnswer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} speakingAnswer`;
  }

  update(id: number, updateSpeakingAnswerDto: UpdateSpeakingAnswerDto) {
    return `This action updates a #${id} speakingAnswer`;
  }

  remove(id: number) {
    return `This action removes a #${id} speakingAnswer`;
  }
}
