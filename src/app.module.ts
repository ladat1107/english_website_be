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
import { UserFlashcardModule } from './user-flashcard/user-flashcard.module';
import { AuthModule } from './auth/auth.module';
import { SocketModule } from './socket/socket.module';
import { configValidationSchema } from './config/config.schema';
import appConfig from '@/config/app.config';
import authConfig from '@/config/auth.config';
import groqConfig from '@/config/groq.config';
import dbConfig from '@/config/db.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ClassSessionsModule } from './class-sessions/class-sessions.module';
import { ParticipantsModule } from './participants/participants.module';
import mailConfig from './config/mail.config';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
import { WritingExamModule } from './writing-exam/writing-exam.module';
import { WritingAnswerModule } from './writing-answer/writing-answer.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, dbConfig, groqConfig, mailConfig],
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
    UserFlashcardModule,
    AuthModule,
    SocketModule,
    ClassSessionsModule,
    ParticipantsModule,
    MailModule,
    ChatModule,
    WritingExamModule,
    WritingAnswerModule,
    BlogModule
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
