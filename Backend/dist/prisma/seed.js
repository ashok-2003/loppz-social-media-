"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// social-app-backend/prisma/seed.ts
const faker_1 = require("@faker-js/faker");
const client_1 = require("@prisma/client");
// Initialize Prisma Client
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Starting Database Seeding ---');
    // --- 1. Clear existing data (for a clean slate on each seed run) ---
    // Order matters due to foreign key constraints
    await prisma.notification.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    console.log('Cleared existing data from Notification, Follow, Post, and User tables.');
    // --- 2. Create Celebrity Users ---
    const celebritiesData = [
        {
            username: 'LeoMessi',
            email: 'messi@example.com',
            password: 'password123', // Keeping it simple as requested
            avatarUrl: 'https://placehold.co/128x128/FF5733/white?text=LM',
            bio: 'Professional footballer. Living legend.',
            isVerified: true,
        },
        {
            username: 'TaylorSwift',
            email: 'taylor@example.com',
            password: 'password123',
            avatarUrl: 'https://placehold.co/128x128/DAF7A6/black?text=TS',
            bio: 'Singer-songwriter. Cat enthusiast.',
            isVerified: true,
        },
        {
            username: 'ElonMusk',
            email: 'elon@example.com',
            password: 'password123',
            avatarUrl: 'https://placehold.co/128x128/33C7FF/white?text=EM',
            bio: 'Technoking of Tesla, Imperator of Mars.',
            isVerified: true,
        },
        {
            username: 'RihannaFenty',
            email: 'rihanna@example.com',
            password: 'password123',
            avatarUrl: 'https://placehold.co/128x128/9B59B6/white?text=RF',
            bio: 'Singer, businesswoman, fashion icon.',
            isVerified: true,
        },
        {
            username: 'DwayneTheRock',
            email: 'rock@example.com',
            password: 'password123',
            avatarUrl: 'https://placehold.co/128x128/F1C40F/black?text=TR',
            bio: 'Actor, producer, former professional wrestler. Can you smell what The Rock is cooking?',
            isVerified: true,
        }
    ];
    const createdCelebrities = [];
    for (const data of celebritiesData) {
        const celebrity = await prisma.user.create({
            data: {
                ...data,
                role: client_1.UserRole.CELEBRITY,
            },
        });
        createdCelebrities.push(celebrity);
        console.log(`Created celebrity user: ${celebrity.username} (${celebrity.email})`);
    }
    // --- 3. Create Public Users ---
    const numPublicUsers = 15;
    const createdPublicUsers = [];
    for (let i = 0; i < numPublicUsers; i++) {
        const publicUser = await prisma.user.create({
            data: {
                email: faker_1.faker.internet.email().toLowerCase(),
                password: 'publicpassword', // Simple password for public users
                username: faker_1.faker.internet.userName(),
                role: client_1.UserRole.PUBLIC,
                avatarUrl: faker_1.faker.image.avatar(),
                bio: faker_1.faker.lorem.sentence(5) + '.',
            },
        });
        createdPublicUsers.push(publicUser);
        console.log(`Created public user: ${publicUser.username} (${publicUser.email})`);
    }
    // --- 4. Public Users Follow Celebrities ---
    // Each public user follows at least 1-3 random celebrities
    for (const publicUser of createdPublicUsers) {
        const numFollows = faker_1.faker.number.int({ min: 1, max: 3 });
        const celebritiesToFollow = faker_1.faker.helpers.arrayElements(createdCelebrities, numFollows);
        for (const celebrity of celebritiesToFollow) {
            try {
                await prisma.follow.create({
                    data: {
                        userId: publicUser.id,
                        celebrityId: celebrity.id,
                    },
                });
                console.log(`${publicUser.username} followed ${celebrity.username}`);
            }
            catch (e) {
                if (e.code === 'P2002') { // Unique constraint violation
                    // console.log(`${publicUser.username} already follows ${celebrity.username}, skipping.`);
                }
                else {
                    throw e; // Re-throw other errors
                }
            }
        }
    }
    // --- 5. Celebrities Create Posts (Increased Quantity) ---
    const numPostsPerCelebrity = 50; // <--- INCREASED THIS FROM 5 TO 50
    for (const celebrity of createdCelebrities) {
        for (let i = 0; i < numPostsPerCelebrity; i++) {
            const postContent = faker_1.faker.lorem.sentence(faker_1.faker.number.int({ min: 10, max: 50 }));
            const hasImage = faker_1.faker.datatype.boolean(); // Randomly decide if post has an image
            const post = await prisma.post.create({
                data: {
                    content: postContent,
                    imageUrl: hasImage ? faker_1.faker.image.urlLoremFlickr({ width: 640, height: 480, category: 'abstract' }) : null,
                    likesCount: faker_1.faker.number.int({ min: 0, max: 1000 }), // Random likes
                    authorId: celebrity.id,
                },
            });
            console.log(`Celebrity ${celebrity.username} created post: "${post.content.substring(0, 50)}..."`);
        }
    }
    // --- 6. Create some initial Notifications for random public users ---
    // Create notifications for a few public users about new posts from their followed celebrities
    const notificationsToCreate = 5; // Total number of sample notifications
    for (let i = 0; i < notificationsToCreate; i++) {
        const randomPublicUser = faker_1.faker.helpers.arrayElement(createdPublicUsers);
        const followedCelebrities = await prisma.follow.findMany({
            where: { userId: randomPublicUser.id },
            select: { celebrity: { select: { id: true, username: true } } }
        });
        if (followedCelebrities.length > 0) {
            const randomFollowedCelebrity = faker_1.faker.helpers.arrayElement(followedCelebrities).celebrity;
            const recentPostByCelebrity = await prisma.post.findFirst({
                where: { authorId: randomFollowedCelebrity.id },
                orderBy: { createdAt: 'desc' }
            });
            if (recentPostByCelebrity) {
                await prisma.notification.create({
                    data: {
                        userId: randomPublicUser.id,
                        type: client_1.NotificationType.NEW_POST,
                        message: `${randomFollowedCelebrity.username} just posted: "${recentPostByCelebrity.content.substring(0, 40)}..."`,
                        isRead: faker_1.faker.datatype.boolean(), // Some read, some unread
                        celebrityId: randomFollowedCelebrity.id,
                        postId: recentPostByCelebrity.id,
                    },
                });
                // Increment unread count if it's an unread notification
                if (!faker_1.faker.datatype.boolean()) { // If isRead is false
                    await prisma.user.update({
                        where: { id: randomPublicUser.id },
                        data: { unreadNotificationCount: { increment: 1 } }
                    });
                }
                console.log(`Created notification for ${randomPublicUser.username} about ${randomFollowedCelebrity.username}`);
            }
        }
    }
    console.log('--- Database Seeding Finished Successfully ---');
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
});
