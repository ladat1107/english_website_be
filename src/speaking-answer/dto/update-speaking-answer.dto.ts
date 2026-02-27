import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeakingAnswerDto } from './create-speaking-answer.dto';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateSpeakingAnswerDto extends PartialType(CreateSpeakingAnswerDto) {

    @IsOptional()
    @IsString()
    teacher_feedback?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    score?: number;

    
}
