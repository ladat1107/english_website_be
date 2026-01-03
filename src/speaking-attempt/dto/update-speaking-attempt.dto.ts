import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeakingAttemptDto } from './create-speaking-attempt.dto';

export class UpdateSpeakingAttemptDto extends PartialType(CreateSpeakingAttemptDto) {}
