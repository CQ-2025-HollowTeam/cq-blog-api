import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common';

export class PaginationPostDto extends PaginationDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    content?: string;

    @ApiPropertyOptional({
        type: String,
        description: 'Filters posts by author name',
    })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiPropertyOptional({
        type: [String],
        description:
            'Filters posts by category slugs, separated by commas (e.g., "angular,nest")',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',');
        }
        return value;
    })
    categories?: string[];
}
