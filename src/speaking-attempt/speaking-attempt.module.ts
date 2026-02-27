import { forwardRef, Module } from '@nestjs/common';
import { SpeakingAttemptService } from './speaking-attempt.service';
import { SpeakingAttemptController } from './speaking-attempt.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SpeakingAttemptSchema } from './schemas/speaking-attempt.schemas';
import { SpeakingAnswerModule } from '@/speaking-answer/speaking-answer.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'SpeakingAttempt', schema: SpeakingAttemptSchema }]),
    forwardRef(() => SpeakingAnswerModule),
  ],
  exports: [SpeakingAttemptService],
  controllers: [SpeakingAttemptController],
  providers: [SpeakingAttemptService],
})
export class SpeakingAttemptModule { }
