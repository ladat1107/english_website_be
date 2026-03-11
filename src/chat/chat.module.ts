import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GroqModule } from '@/groq/groq.module';

@Module({
  imports: [
    GroqModule
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule { }
