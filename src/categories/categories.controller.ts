import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { RoleProtected } from 'src/auth/decorators/role-protected.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @RoleProtected(Role.ADMIN, Role.EDITOR)
    @Post()
    @ApiOperation({
        summary: 'Create a new category',
        description:
            'Creates a new category with name and slug. The slug must be unique.',
    })
    @ApiCreatedResponse({
        description: 'Category created successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data provided',
    })
    @ApiConflictResponse({
        description: 'Category with this slug already exists',
    })
    create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoriesService.create(createCategoryDto);
    }

    @Public()
    @Get()
    @ApiOperation({
        summary: 'Get all categories',
        description:
            'Retrieves a list of all categories ordered alphabetically by name (A-Z)',
    })
    @ApiOkResponse({
        description: 'List of categories retrieved successfully',
    })
    findAll(): Promise<Category[]> {
        return this.categoriesService.findAll();
    }

    @Public()
    @Get(':id')
    @ApiOperation({
        summary: 'Get category by ID',
        description: 'Retrieves a specific category by its unique identifier',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the category',
        type: Number,
        example: 1,
    })
    @ApiOkResponse({
        description: 'Category found and returned successfully',
    })
    @ApiNotFoundResponse({
        description: 'Category with the specified ID not found',
    })
    @ApiBadRequestResponse({
        description: 'Invalid ID format provided',
    })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
        return this.categoriesService.findOne(id);
    }

    @RoleProtected(Role.ADMIN, Role.EDITOR)
    @Patch(':id')
    @ApiOperation({
        summary: 'Update an existing category',
        description:
            'Updates category information such as name or slug. Slug must remain unique.',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the category to update',
        type: Number,
        example: 1,
    })
    @ApiOkResponse({
        description: 'Category updated successfully',
    })
    @ApiNotFoundResponse({
        description: 'Category with the specified ID not found',
    })
    @ApiBadRequestResponse({
        description: 'Invalid data provided or ID format incorrect',
    })
    @ApiConflictResponse({
        description: 'Category with this slug already exists',
    })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<Category> {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @RoleProtected(Role.ADMIN, Role.EDITOR)
    @Delete(':id')
    @ApiOperation({
        summary: 'Delete a category',
        description:
            'Permanently removes a category. This action cannot be undone.',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the category to delete',
        type: Number,
        example: 1,
    })
    @ApiOkResponse({
        description: 'Category deleted successfully',
    })
    @ApiNotFoundResponse({
        description: 'Category with the specified ID not found',
    })
    @ApiBadRequestResponse({
        description: 'Invalid ID format provided',
    })
    remove(@Param('id', ParseIntPipe) id: number): Promise<Category> {
        return this.categoriesService.remove(id);
    }
}
