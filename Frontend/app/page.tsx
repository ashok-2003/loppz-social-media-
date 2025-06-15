import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/config/icons";
import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import PostsFeed from "@/components/PostsFeed";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>Social Feed</h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Explore posts from all celebrities
        </h2>
      </div>

      {/* Universal Public Feed - accessible by everyone */}
      <div className="w-full max-w-2xl mx-auto">
        {session && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {session.user?.email}! 
              <Link href="/feed" className="ml-2 text-blue-500 hover:underline">
                View your personalized feed →
              </Link>
            </p>
          </div>
        )}
        
        {!session && (
          <div className="mb-6 flex gap-3 justify-center">
            <Link
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "shadow",
              })}
              href="/auth/signin"
            >
              Sign In
            </Link>
            <Link
              className={buttonStyles({ variant: "bordered", radius: "full" })}
              href="/auth/signup"
            >
              Sign Up
            </Link>
          </div>
        )}
        
        {/* Universal Posts Feed - All Posts */}
        <PostsFeed />
      </div>
    </section>
  );
}



