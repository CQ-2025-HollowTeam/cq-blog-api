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
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
    ApiBody,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
} from '@nestjs/swagger';
import { PaginationPostDto } from './dto/pagination-post.dto';
import { PaginatedResponse } from 'src/common';
import { Post as PostModel, PostReaction } from '@prisma/client';
import { ReactionsService } from 'src/reactions/reactions.service';
import { CreateReactionDto } from 'src/reactions/dto/create-reaction.dto';
import { RemoveReactionDto } from 'src/reactions/dto/remove-reaction.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileImageFilter } from 'src/common/helpers/file-image-filter.helper';
import { diskStorage } from 'multer';
import { filename } from 'src/common/helpers/filename.helper';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly reactionsService: ReactionsService,
    ) {}

    @Public()
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        fileFilter: fileImageFilter,
        storage: diskStorage({
            destination: './uploads/posts',
            filename: filename
        })
    }))
    @ApiOperation({ summary: 'Create a new post' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Title of the post' },
                slug: { type: 'string', description: 'URL-friendly slug' },
                content: { type: 'string', description: 'Content of the post' },
                authorId: { type: 'string', description: 'ID of the post author' },
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Cover image for the post',
                },
            },
            required: ['title', 'slug', 'content', 'authorId'],
        },
        description: 'Data to create a new post, including a cover image',
    })
    
    @ApiOkResponse({ description: 'Post created successfully' })
    create(@Body() createPostDto: CreatePostDto, @UploadedFile('file') file: Express.Multer.File): Promise<PostModel> {
        return this.postsService.create(createPostDto, file);
    }

    @Get()
    @ApiOperation({
        summary:
            'Get a list of all posts with pagination or retrieve a post by slug',
    })
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

    @Public()
    @Patch(':id')
    @UseInterceptors(FileInterceptor('file', {
        fileFilter: fileImageFilter,
        storage: diskStorage({
            destination: './uploads/posts',
            filename: filename
        })
    }))
    @ApiOperation({ summary: 'Update an existing post' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Updated title of the post' },
                slug: { type: 'string', description: 'Updated URL-friendly slug' },
                content: { type: 'string', description: 'Updated content of the post' },
                authorId: { type: 'string', description: 'ID of the post author' },
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'New cover image for the post',
                },
            },
        },
        description: 'Data to update an existing post, including an optional new cover image',
    })
    @ApiOkResponse({ description: 'Post updated successfully.' })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePostDto: UpdatePostDto,
        @UploadedFile('file') file: Express.Multer.File
    ): Promise<PostModel> {
        return this.postsService.update(id, updatePostDto, file);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a post' })
    @ApiOkResponse({ description: 'Post deleted successfully.' })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    remove(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
        return this.postsService.remove(id);
    }

    @Post(':id/reactions')
    @ApiOperation({
        summary: 'Add or update a reaction to a post',
        description:
            'Creates a new reaction or updates an existing one for the specified post. Each user can only have one reaction per post.',
    })
    @ApiParam({
        name: 'id',
        description: 'The ID of the post to react to',
        type: Number,
    })
    @ApiOkResponse({
        description: 'Post reaction created or updated successfully.',
    })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    createOrUpdateReaction(
        @Param('id', ParseIntPipe) postId: number,
        @Body() createReactionDto: CreateReactionDto,
    ): Promise<PostReaction> {
        return this.reactionsService.createOrUpdatePostReaction(
            createReactionDto,
            postId,
        );
    }

    @Delete(':id/reactions')
    @ApiOperation({
        summary: 'Remove a reaction from a post',
        description: "Removes the user's reaction from the specified post",
    })
    @ApiParam({
        name: 'id',
        description: 'The ID of the post to remove reaction from',
        type: Number,
    })
    @ApiOkResponse({
        description: 'Post reaction removed successfully.',
    })
    removeReaction(
        @Param('id', ParseIntPipe) postId: number,
        @Body() removeReactionDto: RemoveReactionDto,
    ): Promise<PostReaction> {
        return this.reactionsService.removePostReaction(removeReactionDto, postId);
    }
}
