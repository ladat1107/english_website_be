import { forwardRef, Module } from '@nestjs/common';
import { WritingAnswerService } from './writing-answer.service';
import { WritingAnswerController } from './writing-answer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WritingAnswer, WritingAnswerSchema } from './schemas/writing-answer.schemas';
import { GroqModule } from '@/groq/groq.module';
import { WritingExamModule } from '@/writing-exam/writing-exam.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WritingAnswer.name, schema: WritingAnswerSchema },
    ]),
    GroqModule,
    forwardRef(() => WritingExamModule),
  ],
  controllers: [WritingAnswerController],
  providers: [WritingAnswerService],
  exports: [WritingAnswerService],
})
export class WritingAnswerModule { }
