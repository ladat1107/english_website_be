import { Injectable } from '@nestjs/common';
import { CreateSpeakingAttemptDto } from './dto/create-speaking-attempt.dto';
import { UpdateSpeakingAttemptDto } from './dto/update-speaking-attempt.dto';

@Injectable()
export class SpeakingAttemptService {
  create(createSpeakingAttemptDto: CreateSpeakingAttemptDto) {
    return 'This action adds a new speakingAttempt';
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
