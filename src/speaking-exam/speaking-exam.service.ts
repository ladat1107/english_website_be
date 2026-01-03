import { Injectable } from '@nestjs/common';
import { CreateSpeakingExamDto } from './dto/create-speaking-exam.dto';
import { UpdateSpeakingExamDto } from './dto/update-speaking-exam.dto';

@Injectable()
export class SpeakingExamService {
  create(createSpeakingExamDto: CreateSpeakingExamDto) {
    return 'This action adds a new speakingExam';
  }

  findAll() {
    return `This action returns all speakingExams`;
  }

  findOne(id: number) {
    return `This action returns a #${id} speakingTopic`;
  }

  update(id: number, updateSpeakingExamDto: UpdateSpeakingExamDto) {
    return `This action updates a #${id} speakingExam`;
  }

  remove(id: number) {
    return `This action removes a #${id} speakingExam`;
  }
}
