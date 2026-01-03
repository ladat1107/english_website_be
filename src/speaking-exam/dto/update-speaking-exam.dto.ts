import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeakingExamDto } from './create-speaking-exam.dto';

export class UpdateSpeakingExamDto extends PartialType(CreateSpeakingExamDto) { }