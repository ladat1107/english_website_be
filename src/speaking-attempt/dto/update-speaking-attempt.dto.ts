import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeakingAttemptDto, MultipleChoiceAnswerDto } from './create-speaking-attempt.dto';
import { IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { ExamAttemptStatus } from '@/utils/constants/enum';
import { MultipleChoiceAnswer } from '../schemas/speaking-attempt.schemas';
import { Type } from 'class-transformer';

export class UpdateSpeakingAttemptDto extends PartialType(CreateSpeakingAttemptDto) {
    @IsOptional()
    @IsEnum(ExamAttemptStatus)
    status?: string;

    @IsOptional()
    started_at?: Date;

    @IsOptional()
    submitted_at?: Date;

    @IsOptional()
    has_teacher_feedback?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MultipleChoiceAnswerDto)
    multiple_choice_answers?: MultipleChoiceAnswerDto[];

}
