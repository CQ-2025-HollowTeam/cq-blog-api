import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReactionDto {
    @ApiProperty({
        description: 'ID of the reaction type (like, dislike, love, etc.)',
        example: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    reactionId: number;
}