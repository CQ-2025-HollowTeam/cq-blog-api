import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common';

export class PaginationCommentDto extends PaginationDto {
    @ApiPropertyOptional({
        type: String,
        description:
            'Filters comments by order by field (e.g., "reactions", "replies", "createdAt")',
    })
    @IsOptional()
    @IsString()
    orderBy?: string;

    @ApiPropertyOptional({
        type: String,
        description:
            'Filters comments by order direction (e.g., "asc", "desc")',
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    orderDirection?: 'asc' | 'desc' = 'desc';
}
