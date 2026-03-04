import { PartialType } from '@nestjs/mapped-types';
import { CreateParticipantDto } from './create-participant.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { RegistrationStatus } from '@/utils/constants/enum';

export class UpdateParticipantDto extends PartialType(CreateParticipantDto) {
   
    @IsOptional()
    @IsEnum(RegistrationStatus)
    status?: RegistrationStatus;
}
