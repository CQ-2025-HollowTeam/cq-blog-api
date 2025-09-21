import { Category, Post, Prisma, PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

/** ===== Configuración ===== */
const NUM_CATEGORIES = 5;
const NUM_USERS = 5; // plus one admin below
const NUM_POSTS = 10;
const COMMENT_CHANCE = 0.5; // 50%
const REACT_CHANCE = 0.75; // 75%
const ROLE_USER = 0;
const ROLE_ADMIN = 2;

function uniqueSlug(title: string) {
    const base = faker.helpers.slugify(title).toLowerCase();
    return `${base}-${faker.string.alphanumeric(6).toLowerCase()}`;
}

async function createRandomUser(
    role: number,
): Promise<Prisma.UserCreateManyInput> {
    const username = faker.internet.username().toLowerCase();

    return {
        username: username,
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        password: await argon2.hash(username), // password is the same as username
        role: role,
        isActive: true,
    };
}

function createRandomPost(
    author: User,
    category: Category,
): Prisma.PostCreateInput {
    const title = faker.lorem.sentence();

    return {
        title: title,
        content: faker.lorem.paragraphs(),
        author: { connect: { id: author.id } },
        categories: { connect: { id: category.id } },
        slug: uniqueSlug(title),
    };
}

function createRandomCategory(): Prisma.CategoryCreateManyInput {
    const name = faker.commerce.department();
    return {
        name,
        slug: uniqueSlug(name),
    };
}

function createRandomComment(
    author: User,
    post: Post,
): Prisma.PostCommentCreateManyInput {
    return {
        content: faker.lorem.sentences(),
        authorId: author.id,
        postId: post.id,
    };
}

function getRandomElement<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)];
}

async function main() {
    // 1) Auth Providers
    await prisma.authProviders.createMany({
        data: [{ name: 'Discord', slug: 'discord' }],
        skipDuplicates: true,
    });

    // 2) Categories
    await prisma.category.createMany({
        data: Array.from({ length: NUM_CATEGORIES }, createRandomCategory),
        skipDuplicates: true,
    });

    // Fetch categories for later use
    const categories = await prisma.category.findMany();

    // 3) Reaction (only 'like' for now)
    const reaction = await prisma.reaction.create({
        data: { type: 'like' },
    });

    // 4) Users and admin user
    await prisma.user.createMany({
        data: await Promise.all(
            Array.from({ length: NUM_USERS }, () =>
                createRandomUser(ROLE_USER),
            ),
        ),
        skipDuplicates: true,
    });

    const admin = await prisma.user.create({
        data: await createRandomUser(ROLE_ADMIN),
    });

    // Fetch users for later use
    const users = await prisma.user.findMany({ where: { role: ROLE_USER } });

    // 5) Posts and category assignation
    const postCreates = Array.from({ length: NUM_POSTS }, () => {
        const category = getRandomElement(categories);

        return prisma.post.create({
            data: createRandomPost(admin, category),
        });
    });
    const posts = await prisma.$transaction(postCreates);

    // 6) Comments and reactions for each post
    for (const post of posts) {
        const commentData: Prisma.PostCommentCreateManyInput[] = [];
        const reactionData: Prisma.PostReactionCreateManyInput[] = [];

        for (const user of users) {
            // Each user comments on the post with a COMMENT_CHANCE chance
            if (Math.random() < COMMENT_CHANCE) {
                commentData.push(createRandomComment(user, post));
            }

            // Each user reacts to the post with a REACT_CHANCE chance
            if (Math.random() < REACT_CHANCE) {
                reactionData.push({
                    postId: post.id,
                    reactionId: reaction.id,
                    userId: user.id,
                });
            }
        }

        await prisma.postComment.createMany({ data: commentData });
        await prisma.postReaction.createMany({ data: reactionData });

        // 6) Reactions to comments
        const comments = await prisma.postComment.findMany({
            where: { postId: post.id },
        });

        const commentReactionData: Prisma.CommentReactionCreateManyInput[] = [];

        for (const comment of comments) {
            for (const user of users) {
                if (Math.random() < REACT_CHANCE) {
                    commentReactionData.push({
                        commentId: comment.id,
                        reactionId: reaction.id,
                        userId: user.id,
                    });
                }
            }
        }
        await prisma.commentReaction.createMany({ data: commentReactionData });
    }

    console.log('Seed data inserted');
}
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
