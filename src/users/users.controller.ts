import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { User } from '@prisma/client';
import {
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { NonEmptyBodyPipe } from 'src/common';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Public()
    @Get('check-availability')
    @ApiOperation({
        summary: 'Check username or email availability',
        description:
            'Validates if a username or email is available for registration. Returns true if available, false if already taken.',
    })
    @ApiQuery({
        name: 'value',
        description: 'Username or email to check for availability',
        type: String,
        required: true,
        example: 'john_doe',
    })
    @ApiOkResponse({
        description: 'Availability check completed successfully',
    })
    @ApiBadRequestResponse({
        description: 'Value parameter is required',
    })
    async checkAvailability(@Query('value') value: string): Promise<boolean> {
        return this.usersService.checkAvailability(value);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Retrieves a specific user by their unique identifier',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the user (UUID)',
        type: String,
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiOkResponse({
        description: 'User found and returned successfully',
    })
    @ApiNotFoundResponse({
        description: 'User with the specified ID not found',
    })
    @ApiBadRequestResponse({
        description: 'Invalid UUID format provided',
    })
    findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update user profile',
        description:
            'Updates user information such as name, email, username, or other profile data',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the user to update (UUID)',
        type: String,
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiOkResponse({
        description: 'User updated successfully',
    })
    @ApiNotFoundResponse({
        description: 'User with the specified ID not found',
    })
    @ApiBadRequestResponse({
        description: 'Invalid data provided or UUID format incorrect',
    })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(NonEmptyBodyPipe) updateUserDto: UpdateUserDto,
        @GetUser() user: User,
    ): Promise<User> {
        return this.usersService.update(id, updateUserDto, user);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete user profile',
        description:
            'Deletes a user account and all associated data',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the user to delete (UUID)',
        type: String,
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiOkResponse({
        description: 'User deleted successfully',
    })
    @ApiNotFoundResponse({
        description: 'User with the specified ID not found',
    })
    @ApiBadRequestResponse({
        description: 'Invalid data provided or UUID format incorrect',
    })
    remove(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: User,
    ): Promise<User> {
        return this.usersService.remove(id, user);
    }
}
