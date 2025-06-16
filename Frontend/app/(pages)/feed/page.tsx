
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { title, subtitle } from "@/components/primitives";
import PostsFeed from "@/components/PostsFeed";
import { Link } from "@heroui/link";
import { LoginWarn } from "@/components/loginWarn";


const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';
export default async function FeedPage() {
  const session = await getServerSession(authOptions);


  // Redirect to signin if not authenticated
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 min-h-96">
        <LoginWarn />
      </div>

    );

  } else {


    const userId = session.user.id
    const endpoint = `/getFeed/${userId}`;
    const url = `${BACKEND_API_URL}${endpoint}`;

    return (
      <section className="flex flex-col items-center justify-center gap-4 p-4 mt-4">
        
        <div className="justify-center inline-block max-w-2xl text-center">
          <p className={title({ color: "cyan", size: "md" })}>Your Personal Feed</p>
          <p className={subtitle({ class: "mt-4" })}>
            Posts from celebrities you follow
          </p>
        </div>

        <div className="w-full max-w-3xl">
          <div className="flex gap-2 p-2 mb-6 rounded-full">
            <p> welcome back {session.user.name}, Explore</p>
            <p >
              <Link href="/" showAnchorIcon>
                public feed
              </Link>
            </p>

          </div>

          <PostsFeed url={url} isPersonalFeed={true} />
        </div>
      </section>
    );
  }
}

