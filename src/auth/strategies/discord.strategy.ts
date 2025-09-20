import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Strategy } from 'passport-discord';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthStrategy } from '../enums/auth-strategy.enum';
import { DiscordProfile } from '../interfaces/discord-profile.interface';
import { AuthService } from '../auth.service';
import { Role } from '../enums/role.enum';

@Injectable()
export class DiscordStrategy extends PassportStrategy(
    Strategy,
    AuthStrategy.DISCORD,
) {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: configService.get('DISCORD_CLIENT_ID'),
            clientSecret: configService.get('DISCORD_CLIENT_SECRET'),
            callbackURL: configService.get('DISCORD_CALLBACK_URL'),
            scope: ['identify', 'email'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: DiscordProfile,
    ): Promise<any> {
        const authProvider = await this.prisma.authProviders.findUnique({
            where: { slug: AuthStrategy.DISCORD },
        });

        if (!authProvider) {
            throw new UnauthorizedException('Discord auth provider not found');
        }

        // Find the user associated with this discord profile
        let user: User = await this.prisma.user.findFirst({
            where: {
                authProviders: {
                    some: {
                        providerUserId: profile.id,
                        authProviderId: authProvider.id,
                    },
                },
            },
        });

        // If the user does not exist, create a new one
        if (!user) {
            user = await this.authService.createUser({
                username: profile.username,
                email: profile.email,
                name: profile.global_name,
                role: Role.USER,
                authProviders: {
                    create: {
                        providerUserId: profile.id,
                        authProviderId: authProvider.id,
                    },
                },
            });
        }

        if (!user.isActive) {
            throw new UnauthorizedException(
                'User is inactive, talk with an admin',
            );
        }

        return user;
    }
}
