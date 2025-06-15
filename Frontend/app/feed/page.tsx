// app/feed/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/config/auth";
import { title, subtitle } from "@/components/primitives";
import PostsFeed from "@/components/PostsFeed";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import PostsFeedPrivate from "@/components/PostsFeedPrivate";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to signin if not authenticated
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>Your Personal Feed</h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Posts from celebrities you follow
        </h2>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        {/* Welcome message */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Welcome back, {session.user?.email}! 
            <Link href="/" className="ml-2 text-blue-600 hover:underline">
              ← Back to public feed
            </Link>
          </p>
        </div>
        
        {/* Personalized Posts Feed */}
        <PostsFeedPrivate userId={session.user?.id} isPersonalFeed={true} />
      </div>
    </section>
  );
}

