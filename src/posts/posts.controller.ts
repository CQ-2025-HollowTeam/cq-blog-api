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
import { Post as PostModel, PostReaction } from '@prisma/client';
import { ReactionsService } from 'src/reactions/reactions.service';
import { CreateReactionDto } from 'src/reactions/dto/create-reaction.dto';
import { RemoveReactionDto } from 'src/reactions/dto/remove-reaction.dto';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly reactionsService: ReactionsService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiOkResponse({ description: 'Post created successfully' })
    create(@Body() createPostDto: CreatePostDto): Promise<PostModel> {
        return this.postsService.create(createPostDto);
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
