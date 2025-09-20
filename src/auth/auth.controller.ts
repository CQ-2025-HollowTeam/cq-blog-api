import { Controller, Post, Body, Get, UseGuards, Res, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-dto';
import { Public } from './decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategy } from './enums/auth-strategy.enum';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Public()
    @Post('register')
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Creates a new user account with email and password',
    })
    @ApiBody({
        type: CreateUserDto,
        description: 'User registration data',
    })
    @ApiOkResponse({
        description: 'User successfully registered',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    @ApiConflictResponse({
        description: 'User already exists',
    })
    create(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Public()
    @ApiOperation({
        summary: 'Login user',
        description: 'Authenticates a user with email/username and password',
    })
    @ApiBody({
        type: LoginUserDto,
        description: 'User login credentials',
    })
    @ApiOkResponse({
        description: 'User successfully authenticated',
    })
    @ApiBadRequestResponse({
        description: 'Invalid credentials format',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials',
    })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Public()
    @Get('discord')
    @UseGuards(AuthGuard(AuthStrategy.DISCORD))
    @ApiOperation({
        summary: 'Initiate Discord OAuth',
        description: 'Redirects user to Discord OAuth authorization page',
    })
    @ApiResponse({
        status: 302,
        description: 'Redirects to Discord OAuth authorization URL',
    })
    @ApiResponse({
        status: 500,
        description: 'OAuth service unavailable',
    })
    async discordLogin() {
        // Redirects to Discord
    }

    @Public()
    @Get('discord/callback')
    @UseGuards(AuthGuard(AuthStrategy.DISCORD))
    @ApiOperation({
        summary: 'Discord OAuth callback',
        description:
            'Handles Discord OAuth callback and redirects to frontend with authentication token',
    })
    @ApiResponse({
        status: 302,
        description: 'Redirects to frontend with authentication token',
    })
    @ApiUnauthorizedResponse({
        description: 'Discord OAuth authentication failed',
    })
    async discordCallback(@GetUser() user: User, @Res() res) {
        const token = await this.authService.loginWithDiscord(user);

        // Get the frontend URL from the configuration
        const frontendUrl = this.configService.get('FRONTEND_URL');

        // Redirect the user to the frontend with the tokens in the URL
        res.redirect(`${frontendUrl}/oauth/${token}`);
    }
}
