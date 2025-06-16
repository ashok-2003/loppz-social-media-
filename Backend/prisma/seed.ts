// social-app-backend/prisma/seed.ts
import { faker } from '@faker-js/faker';
import { PrismaClient , UserRole , NotificationType } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Better avatar URLs using a more reliable service
const getRandomAvatar = (seed: string) => {
  const avatarServices = [
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed}`,
  ];
  return faker.helpers.arrayElement(avatarServices);
};

// Better post content templates
const postTemplates = [
  "Just finished an amazing workout session! 💪 Feeling stronger every day.",
  "Beautiful sunset today. Sometimes you just need to stop and appreciate the little things. 🌅",
  "Excited to share my new project with you all! Hard work pays off. ✨",
  "Coffee and good vibes to start the day right ☕️ What's your morning ritual?",
  "Grateful for all the amazing people in my life. Blessed beyond measure! 🙏",
  "New week, new opportunities! Let's make it count. 💯",
  "Just read an incredible book that changed my perspective. Love learning new things! 📚",
  "Cooking something special tonight. There's nothing like homemade food! 🍳",
  "Weekend adventures are the best kind of therapy. Where should I explore next? 🗺️",
  "Throwback to one of my favorite memories. Good times never get old! 📸",
  "Working on something exciting behind the scenes. Can't wait to share it! 🎬",
  "Music has the power to heal and inspire. What song is on repeat for you? 🎵",
  "Celebrating small wins today. Progress is progress! 🎉",
  "Nature therapy is real. Spending time outdoors always refreshes my soul. 🌿",
  "Late night thoughts: kindness is always the right choice. Spread love! ❤️"
];

// Celebrity-specific post content
const celebrityPosts = {
  'LeoMessi': [
    "Training hard for the upcoming match! The team is looking strong this season. ⚽️",
    "Grateful for all the support from fans around the world. You make it all worth it! 🙏",
    "Family time is the best time. These moments are what life is all about. ❤️",
    "Another day, another opportunity to improve. Never stop learning! 💪",
    "The passion for football never fades. Every game is a new adventure. ⚽️"
  ],
  'TaylorSwift': [
    "Late night songwriting session. When inspiration strikes, you follow it! 🎵",
    "My cats are the best writing companions. They're very honest critics! 🐱",
    "Grateful for every single one of you. Your support means everything to me! ✨",
    "New music coming soon... Can't wait for you to hear what I've been working on! 🎤",
    "Sometimes the best songs come from the most unexpected moments. Stay open! 💫"
  ],
  'ElonMusk': [
    "Mars is looking more achievable every day. The future is going to be wild! 🚀",
    "Tesla's next innovation is going to change everything. Excited to share soon! ⚡️",
    "The intersection of technology and humanity is where magic happens. 🤖",
    "Sustainable transport is not just a dream anymore. It's happening now! 🌍",
    "Sometimes you have to think impossibly big to make the impossible possible. 🌟"
  ],
  'RihannaFenty': [
    "Fenty Beauty is about celebrating everyone's unique beauty. Shine bright! ✨",
    "Music will always be my first love, but business is my passion too! 💼",
    "Representation matters in every industry. Let's keep breaking barriers! 👑",
    "Barbados will always be home. Island life shaped who I am today! 🏝️",
    "Work hard, play harder. Balance is everything in life! 🎉"
  ],
  'DwayneTheRock': [
    "4 AM workout done! The grind never stops, and neither do I! 💪",
    "Grateful for this incredible journey. From wrestling to Hollywood! 🎬",
    "Family first, always. They keep me grounded and motivated! ❤️",
    "Every challenge is an opportunity to grow stronger. Embrace the struggle! 🔥",
    "Tequila business is booming! Cheers to chasing dreams! 🥃"
  ]
};

// Better image URLs using high-quality placeholder services
const getQualityImage = (category: string) => {
  const imageServices = [
    `https://picsum.photos/800/600?random=${Math.random()}`,
    `https://source.unsplash.com/800x600/?${category}`,
  ];
  return faker.helpers.arrayElement(imageServices);
};

// Image categories for variety
const imageCategories = [
  'nature', 'city', 'food', 'travel', 'architecture', 'art', 'music', 
  'technology', 'sports', 'fashion', 'lifestyle', 'sunset', 'portrait'
];

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
      password: 'password123',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LeoMessi&backgroundColor=FF5733',
      bio: 'Professional footballer. Living legend. 🐐⚽️',
      isVerified: true,
    },
    {
      username: 'TaylorSwift',
      email: 'taylor@example.com',
      password: 'password123',
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=TaylorSwift&backgroundColor=DAF7A6',
      bio: 'Singer-songwriter. Cat enthusiast. ✨🎵',
      isVerified: true,
    },
    {
      username: 'ElonMusk',
      email: 'elon@example.com',
      password: 'password123',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ElonMusk&backgroundColor=33C7FF',
      bio: 'Technoking of Tesla, Imperator of Mars. 🚀',
      isVerified: true,
    },
    {
      username: 'RihannaFenty',
      email: 'rihanna@example.com',
      password: 'password123',
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=RihannaFenty&backgroundColor=9B59B6',
      bio: 'Singer, businesswoman, fashion icon. 👑✨',
      isVerified: true,
    },
    {
      username: 'DwayneTheRock',
      email: 'rock@example.com',
      password: 'password123',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DwayneTheRock&backgroundColor=F1C40F',
      bio: 'Actor, producer, former professional wrestler. Can you smell what The Rock is cooking? 🔥💪',
      isVerified: true,
    }
  ];

  const createdCelebrities = [];
  for (const data of celebritiesData) {
    const celebrity = await prisma.user.create({
      data: {
        ...data,
        role: UserRole.CELEBRITY,
      },
    });
    createdCelebrities.push(celebrity);
    console.log(`Created celebrity user: ${celebrity.username} (${celebrity.email})`);
  }

  // --- 3. Create Public Users ---
  const numPublicUsers = 15;
  const createdPublicUsers = [];
  for (let i = 0; i < numPublicUsers; i++) {
    const username = faker.internet.userName();
    const publicUser = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password: 'publicpassword',
        username: username,
        role: UserRole.PUBLIC,
        avatarUrl: getRandomAvatar(username),
        bio: faker.helpers.arrayElement([
          "Living life one day at a time ✨",
          "Adventure seeker and coffee lover ☕️",
          "Dreamer with a passion for creativity 🎨",
          "Fitness enthusiast and positive vibes only 💪",
          "Nature lover and weekend explorer 🌿",
          "Foodie with a camera always ready 📸",
          "Music is my therapy 🎵",
          "Spreading kindness wherever I go ❤️",
          "Always learning, always growing 🌱",
          "Grateful for every moment 🙏"
        ]),
      },
    });
    createdPublicUsers.push(publicUser);
    console.log(`Created public user: ${publicUser.username} (${publicUser.email})`);
  }

  // --- 4. Public Users Follow Celebrities ---
  // Each public user follows at least 1-3 random celebrities
  for (const publicUser of createdPublicUsers) {
    const numFollows = faker.number.int({ min: 1, max: 3 });
    const celebritiesToFollow = faker.helpers.arrayElements(createdCelebrities, numFollows);

    for (const celebrity of celebritiesToFollow) {
      try {
        await prisma.follow.create({
          data: {
            userId: publicUser.id,
            celebrityId: celebrity.id,
          },
        });
        console.log(`${publicUser.username} followed ${celebrity.username}`);
      } catch (e: any) {
        if (e.code === 'P2002') { // Unique constraint violation
          // console.log(`${publicUser.username} already follows ${celebrity.username}, skipping.`);
        } else {
          throw e; // Re-throw other errors
        }
      }
    }
  }

  // --- 5. Celebrities Create Posts (Improved Content) ---
  const numPostsPerCelebrity = 50;
  for (const celebrity of createdCelebrities) {
    for (let i = 0; i < numPostsPerCelebrity; i++) {
      let postContent;
      
      // Use celebrity-specific content 70% of the time, generic 30%
      if (faker.datatype.boolean({ probability: 0.7 }) && celebrityPosts[celebrity.username as keyof typeof celebrityPosts]) {
        postContent = faker.helpers.arrayElement(celebrityPosts[celebrity.username as keyof typeof celebrityPosts]);
      } else {
        postContent = faker.helpers.arrayElement(postTemplates);
      }

      const hasImage = faker.datatype.boolean({ probability: 0.4 }); // 40% chance of having an image
      const imageUrl = hasImage ? getQualityImage(faker.helpers.arrayElement(imageCategories)) : null;
      
      const post = await prisma.post.create({
        data: {
          content: postContent,
          imageUrl: imageUrl,
          likesCount: faker.number.int({ min: 100, max: 10000 }), // More realistic likes for celebrities
          authorId: celebrity.id,
        },
      });
      console.log(`Celebrity ${celebrity.username} created post: "${post.content.substring(0, 50)}..."`);
    }
  }

  // --- 6. Create some initial Notifications for random public users ---
  const notificationsToCreate = 10; // Increased for better variety
  for (let i = 0; i < notificationsToCreate; i++) {
    const randomPublicUser = faker.helpers.arrayElement(createdPublicUsers);
    const followedCelebrities = await prisma.follow.findMany({
      where: { userId: randomPublicUser.id },
      select: { celebrity: { select: { id: true, username: true } } }
    });

    if (followedCelebrities.length > 0) {
      const randomFollowedCelebrity = faker.helpers.arrayElement(followedCelebrities).celebrity;
      const recentPostByCelebrity = await prisma.post.findFirst({
        where: { authorId: randomFollowedCelebrity.id },
        orderBy: { createdAt: 'desc' }
      });

      if (recentPostByCelebrity) {
        const isRead = faker.datatype.boolean({ probability: 0.3 }); // 30% chance of being read
        
        await prisma.notification.create({
          data: {
            userId: randomPublicUser.id,
            type: NotificationType.NEW_POST,
            message: `${randomFollowedCelebrity.username} just posted: "${recentPostByCelebrity.content.substring(0, 50)}..."`,
            isRead: isRead,
            celebrityId: randomFollowedCelebrity.id,
            postId: recentPostByCelebrity.id,
          },
        });
        
        // Increment unread count if it's an unread notification
        if (!isRead) {
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