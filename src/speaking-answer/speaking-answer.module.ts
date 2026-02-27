import { forwardRef, Module } from '@nestjs/common';
import { SpeakingAnswerService } from './speaking-answer.service';
import { SpeakingAnswerController } from './speaking-answer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SpeakingAnswerSchema } from './schemas/speaking-answer.schemas';
import { GroqModule } from '@/groq/groq.module';
import { SpeakingAttemptModule } from '@/speaking-attempt/speaking-attempt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'SpeakingAnswer', schema: SpeakingAnswerSchema }]),
    GroqModule,
    forwardRef(() => SpeakingAttemptModule),
  ],
  exports: [SpeakingAnswerService],
  controllers: [SpeakingAnswerController],
  providers: [SpeakingAnswerService],
})
export class SpeakingAnswerModule { }
