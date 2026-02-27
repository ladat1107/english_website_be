import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeakingAttemptDto } from './create-speaking-attempt.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ExamAttemptStatus } from '@/utils/constants/enum';

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
}
