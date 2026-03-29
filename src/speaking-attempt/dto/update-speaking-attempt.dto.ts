import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeakingAttemptDto, MultipleChoiceAnswerDto } from './create-speaking-attempt.dto';
import { IsArray, IsEnum, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { ExamAttemptStatus } from '@/utils/constants/enum';
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
    @Min(0, { message: 'Điểm phải từ 0 đến 100' })
    @Max(100, { message: 'Điểm phải từ 0 đến 100' })
    score?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MultipleChoiceAnswerDto)
    multiple_choice_answers?: MultipleChoiceAnswerDto[];

}
