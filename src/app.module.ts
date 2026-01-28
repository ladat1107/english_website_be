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
import { AuthModule } from './auth/auth.module';
import { configValidationSchema } from './config/config.schema';
import appConfig from '@/config/app.config';
import authConfig from '@/config/auth.config';
import dbConfig from '@/config/db.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, dbConfig],
      validationSchema: configValidationSchema
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
    UserFlashcardModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
