import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginationDto {
    @ApiPropertyOptional()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}
