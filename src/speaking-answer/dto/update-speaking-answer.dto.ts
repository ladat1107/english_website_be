import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeakingAnswerDto } from './create-speaking-answer.dto';

export class UpdateSpeakingAnswerDto extends PartialType(CreateSpeakingAnswerDto) {}
