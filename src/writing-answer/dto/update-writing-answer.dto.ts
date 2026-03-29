import { PartialType } from '@nestjs/mapped-types';
import { CreateWritingAnswerDto } from './create-writing-answer.dto';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateWritingAnswerDto extends PartialType(CreateWritingAnswerDto) {
    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Điểm phải từ 0 đến 100' })
    @Max(100, { message: 'Điểm phải từ 0 đến 100' })
    score?: number;

    @IsOptional()
    @IsString()
    teacher_feedback?: string;

    @IsOptional()
    @IsBoolean()
    is_pinned?: boolean;
}
