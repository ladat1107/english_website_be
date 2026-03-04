import { Module } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipantSchema } from './schemas/participant.schemas';
import { ClassSessionsModule } from '@/class-sessions/class-sessions.module';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Participant', schema: ParticipantSchema }]),
    ClassSessionsModule,
    MailModule
  ],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
})
export class ParticipantsModule { }
