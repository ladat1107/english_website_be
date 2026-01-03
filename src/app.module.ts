import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExamModule } from './exam/exam.module';
import { SectionModule } from './section/section.module';
import { QuestionModule } from './question/question.module';
import { QuestionGroupModule } from './question-group/question-group.module';
import { ExamAttemptsModule } from './exam-attempts/exam-attempts.module';
import { UserAnswerModule } from './user-answer/user-answer.module';
import { SpeakingExamModule } from './speaking-exam/speaking-exam.module';
import { SpeakingAttemptModule } from './speaking-attempt/speaking-attempt.module';
import { SpeakingAnswerModule } from './speaking-answer/speaking-answer.module';
import { FlashCardDeckModule } from './flash-card-deck/flash-card-deck.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { UserFlashcardModule } from './user-flashcard/user-flashcard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ExamModule,
    SectionModule,
    QuestionModule,
    QuestionGroupModule,
    ExamAttemptsModule,
    UserAnswerModule,
    SpeakingExamModule,
    SpeakingAttemptModule,
    SpeakingAnswerModule,
    FlashCardDeckModule,
    FlashcardModule,
    UserFlashcardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
