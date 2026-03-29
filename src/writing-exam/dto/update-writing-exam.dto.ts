import { PartialType } from '@nestjs/mapped-types';
import { CreateWritingExamDto } from './create-writing-exam.dto';

export class UpdateWritingExamDto extends PartialType(CreateWritingExamDto) {}
