import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeakingExamDto } from './create-speaking-exam.dto';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';

export class UpdateSpeakingExamDto extends PartialType(CreateSpeakingExamDto) {
    @IsOptional()
    @IsBoolean()
    is_published?: boolean;
}