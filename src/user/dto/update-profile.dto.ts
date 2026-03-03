import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateProfileDto extends PartialType(
    OmitType(CreateUserDto, ['email', 'role', 'googleId'] as const),
) { }