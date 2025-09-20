import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReactionDto {
    @ApiProperty({
        description: 'ID of the user making the reaction',
        example: 'user-uuid-123',
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'ID of the reaction type (like, dislike, love, etc.)',
        example: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    reactionId: number;
}