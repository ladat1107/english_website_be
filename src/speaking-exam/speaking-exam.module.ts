import { Module } from '@nestjs/common';
import { SpeakingExamService } from './speaking-exam.service';
import { SpeakingExamController } from './speaking-exam.controller';

@Module({
  controllers: [SpeakingExamController],
  providers: [SpeakingExamService],
})
export class SpeakingExamModule { }