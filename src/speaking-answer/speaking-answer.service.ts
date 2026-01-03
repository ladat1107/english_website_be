import { Injectable } from '@nestjs/common';
import { CreateSpeakingAnswerDto } from './dto/create-speaking-answer.dto';
import { UpdateSpeakingAnswerDto } from './dto/update-speaking-answer.dto';

@Injectable()
export class SpeakingAnswerService {
  create(createSpeakingAnswerDto: CreateSpeakingAnswerDto) {
    return 'This action adds a new speakingAnswer';
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
