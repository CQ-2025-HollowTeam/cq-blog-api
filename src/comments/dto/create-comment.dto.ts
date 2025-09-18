import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(191)
    authorId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    parentId: number;
}
