import { CreateSpeakingAnswerDto } from "@/speaking-answer/dto/create-speaking-answer.dto";
import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, ValidateNested } from "class-validator";

export class CreateSpeakingAttemptDto {
    @IsMongoId()
    exam_id: string;

    @IsNotEmpty()
    started_at: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSpeakingAnswerDto)
    answers: CreateSpeakingAnswerDto[];

}
