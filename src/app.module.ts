import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';
import { PrismaModule } from './prisma/prisma.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [AppConfiguration],
            validationSchema: JoiValidationSchema,
        }),
        PrismaModule,
        PostsModule,
        AuthModule,
        CommentsModule,
        ReactionsModule,
        UsersModule
    ],
})
export class AppModule {}
