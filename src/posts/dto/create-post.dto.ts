import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(191)
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(191)
    slug: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(191)
    authorId: string;

    @ApiProperty()
    @IsArray()
    categories: number[];
}
