import { Module } from '@nestjs/common';
import { SpeakingExamService } from './speaking-exam.service';
import { SpeakingExamController } from './speaking-exam.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SpeakingExam, SpeakingExamSchema } from './schemas/speaking-exam.schemas';
import { SpeakingAttemptModule } from '@/speaking-attempt/speaking-attempt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SpeakingExam.name, schema: SpeakingExamSchema }]),
    SpeakingAttemptModule
  ],
  exports: [SpeakingExamService],
  controllers: [SpeakingExamController],
  providers: [SpeakingExamService],
})
export class SpeakingExamModule { }