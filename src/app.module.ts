import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';
import { PrismaModule } from './prisma/prisma.module';
import { PostsModule } from './posts/posts.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [AppConfiguration],
            validationSchema: JoiValidationSchema,
        }),
        PrismaModule,
        PostsModule,
    ],
})
export class AppModule {}
