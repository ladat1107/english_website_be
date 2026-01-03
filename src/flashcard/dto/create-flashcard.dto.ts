import { IsString, IsOptional, IsNumber, IsArray, IsMongoId, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CardSideDto {
    @IsString()
    text: string;

    @IsString()
    @IsOptional()
    image_url?: string;

    @IsString()
    @IsOptional()
    audio_url?: string;
}

class BackSideDto extends CardSideDto {
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    examples?: string[];

    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreateFlashcardDto {
    @IsMongoId()
    deck_id: string;

    @ValidateNested()
    @Type(() => CardSideDto)
    front: CardSideDto;

    @ValidateNested()
    @Type(() => BackSideDto)
    back: BackSideDto;

    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    difficulty?: number;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}
