import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
} from '@nestjs/swagger';
import { PaginationPostDto } from './dto/pagination-post.dto';
import { PaginatedResponse } from 'src/common';
import { Post as PostModel } from '@prisma/client';
import { RoleProtected } from 'src/auth/decorators/role-protected.decorator';
import { Roles } from 'src/auth/interfaces/roles.interface';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiOkResponse({ description: 'Post created successfully' })
    create(@Body() createPostDto: CreatePostDto): Promise<PostModel> {
        return this.postsService.create(createPostDto);
    }

    @Get()
    @RoleProtected(Roles.ADMIN)
    @ApiOperation({ summary: 'Get a list of all posts with pagination or retrieve a post by slug' })
    @ApiOkResponse({ description: 'List of posts.' })
    async findAll(
        @Query() paginationPostDto: PaginationPostDto,
    ): Promise<PaginatedResponse<PostModel> | PostModel> {
        return this.postsService.find(paginationPostDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a post by ID' })
    @ApiParam({
        name: 'id',
        description: 'The ID of the post',
        type: Number,
    })
    @ApiOkResponse({ description: 'Post found.' })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
        return this.postsService.findById(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing post' })
    @ApiOkResponse({ description: 'Post updated successfully.' })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePostDto: UpdatePostDto,
    ): Promise<PostModel> {
        return this.postsService.update(id, updatePostDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a post' })
    @ApiOkResponse({ description: 'Post deleted successfully.' })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    remove(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
        return this.postsService.remove(id);
    }
}
