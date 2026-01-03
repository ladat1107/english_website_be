import { Module } from '@nestjs/common';
import { SpeakingAnswerService } from './speaking-answer.service';
import { SpeakingAnswerController } from './speaking-answer.controller';

@Module({
  controllers: [SpeakingAnswerController],
  providers: [SpeakingAnswerService],
})
export class SpeakingAnswerModule {}
