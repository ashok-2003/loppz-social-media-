import { Link } from "@heroui/link";
import { title, subtitle } from "@/components/primitives";
import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import { SessionUser } from "@/types";
import { LoginWarn } from "@/components/loginWarn";
import PostsFeed from "@/components/PostsFeed";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default async function Home() {
  const session: SessionUser | null = await getServerSession(authOptions);
  console.log(session);
  const endpoint = '/getAll';
  const url = `${BACKEND_API_URL}${endpoint}`;

  return (
    <section className="flex flex-col items-center justify-center gap-4 p-4 mt-4">

      <div className="justify-center inline-block max-w-2xl text-center">
        <p className={title({ color: "cyan", size: "md" })}>Social Feed</p>
        <p className={subtitle({ class: "mt-4" })}>
          Explore posts from all celebrities.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        {session && (
          <div className="flex gap-2 p-2 mb-6 rounded-full">
            <p> Hey {session.user.name}, see your</p>
            <p >
              <Link href="/feed" showAnchorIcon>
                feed
              </Link>
            </p>
          </div>
        )}

        {/* if not loggeing in warn him*/}
        {!session && (
          <LoginWarn />
        )}



        {/* Universal Posts Feed - All Posts */}
        <PostsFeed url={url} />
      </div>
    </section>
  );
}



