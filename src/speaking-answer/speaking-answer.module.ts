import { Module } from '@nestjs/common';
import { SpeakingAnswerService } from './speaking-answer.service';
import { SpeakingAnswerController } from './speaking-answer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SpeakingAnswerSchema } from './schemas/speaking-answer.schemas';
import { GroqModule } from '@/groq/groq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'SpeakingAnswer', schema: SpeakingAnswerSchema }]),
    GroqModule,
  ],
  exports: [SpeakingAnswerService],
  controllers: [SpeakingAnswerController],
  providers: [SpeakingAnswerService],
})
export class SpeakingAnswerModule { }
