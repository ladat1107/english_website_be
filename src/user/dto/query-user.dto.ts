import { IsEnum, IsOptional, IsString, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";
import { ProficiencyLevel, SpeakingTopic, UserRole } from "@/utils/constants/enum";
import { PaginationDto } from "@/common/dto/filter-query.dto";

/**
 * Query DTO kế thừa Base Pagination + Filter riêng
 */
export class QueryUserDto extends PaginationDto {
    @IsOptional()
    @IsEnum(UserRole, { message: 'Role không hợp lệ' })
    role?: UserRole;

    @IsOptional()
    @IsEnum(ProficiencyLevel, { message: 'Level không hợp lệ' })
    current_level?: ProficiencyLevel;

    @IsOptional()
    @IsString()
    booking_test?: string;
}