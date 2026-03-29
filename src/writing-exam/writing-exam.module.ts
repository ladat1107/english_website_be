import { forwardRef, Module } from '@nestjs/common';
import { WritingExamService } from './writing-exam.service';
import { WritingExamController } from './writing-exam.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WritingExam, WritingExamSchema } from './schemas/writing-exam.schemas';
import { WritingAnswerModule } from '@/writing-answer/writing-answer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WritingExam.name, schema: WritingExamSchema },
    ]),
    forwardRef(() => WritingAnswerModule),
  ],
  controllers: [WritingExamController],
  providers: [WritingExamService],
  exports: [WritingExamService],
})
export class WritingExamModule { }
