import { Controller, Post, Body, Request } from '@nestjs/common';

import { ChatService } from './chat.service';
import { CreateChatAIDto } from './dto/create-chat-ai.dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post()
    create(@Body() createChatAIDto: CreateChatAIDto) {
        return this.chatService.create(createChatAIDto);
    }
}
