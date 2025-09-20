import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveReactionDto {
    @ApiProperty({
        description: 'ID of the user removing the reaction',
        example: 'user-uuid-123',
    })
    @IsString()
    @IsNotEmpty()
    userId: string;
}