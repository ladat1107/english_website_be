import { IsNotEmpty } from 'class-validator';

export class QueryClassSessionDto {
    @IsNotEmpty()
    startDate?: string;

    @IsNotEmpty()
    endDate?: string;
}
