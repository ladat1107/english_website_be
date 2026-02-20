import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateQuestionSnapshotDto {
    @IsNumber()
    @Min(1)
    question_number: number;

    @IsString()
    @IsNotEmpty()
    question_text: string;
}