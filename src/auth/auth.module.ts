import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DiscordStrategy } from './strategies/discord.strategy';
import { AuthStrategy } from './enums/auth-strategy.enum';

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        PrismaService,
        JwtStrategy,
        DiscordStrategy,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
    imports: [
        PassportModule.register({ defaultStrategy: AuthStrategy.JWT }),

        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN'),
                    },
                };
            },
        }),
        ConfigModule,
    ],
    exports: [AuthService, JwtStrategy, DiscordStrategy],
})
export class AuthModule {}
