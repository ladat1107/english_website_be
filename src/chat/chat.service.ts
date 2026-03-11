import { Injectable } from '@nestjs/common';
import { JwtPayload } from '@/auth/auth.service';
import { CreateChatAIDto } from './dto/create-chat-ai.dto';
import { AIAnalysisService } from '@/groq/ai-analysis.service';

@Injectable()
export class ChatService {

    constructor(
        private aiService: AIAnalysisService
    ) { }

    async create(createChatAIDto: CreateChatAIDto) {
        try {
            const createdChatAI = await this.aiService.chatWithAI(createChatAIDto);
            return createdChatAI;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


}
