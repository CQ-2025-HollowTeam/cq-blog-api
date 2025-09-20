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

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Public()
    @Post('register')
    create(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Public()
    @Get('discord')
    @UseGuards(AuthGuard(AuthStrategy.DISCORD))
    async discordLogin() {
        // Redirects to Discord
    }

    @Public()
    @Get('discord/callback')
    @UseGuards(AuthGuard(AuthStrategy.DISCORD))
    async discordCallback(@GetUser() user: User, @Res() res) {
        const token = await this.authService.loginWithDiscord(user);

        // Get the frontend URL from the configuration
        const frontendUrl = this.configService.get('FRONTEND_URL');

        // Redirect the user to the frontend with the tokens in the URL
        res.redirect(
            `${frontendUrl}/oauth/${token}`,
        );
    }
}
