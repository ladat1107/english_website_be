import { IsString } from "class-validator";
import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ChatMessageDto {
    @IsString()
    role: string;

    @IsString()
    content: string;
}

export class CreateChatAIDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChatMessageDto)
    messages: ChatMessageDto[];
}