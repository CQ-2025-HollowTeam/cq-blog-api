import { Controller, Get } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { Author } from './interfaces/author.interface';

@Controller('authors')
export class AuthorsController {
    constructor(private readonly authorsService: AuthorsService) {}

    @Public()
    @Get()
    @ApiOperation({
        summary: 'Get all authors',
        description:
            'Retrieves a list of all users with author privileges (admin and editor roles). Authors are users who can create and manage blog posts.',
    })
    @ApiOkResponse({
        description: 'List of authors retrieved successfully',
    })
    findAll(): Promise<Author[]> {
        return this.authorsService.findAll();
    }
}
