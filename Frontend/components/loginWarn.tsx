import { Link } from "@heroui/link";
import { title } from "./primitives";
import { Button } from "@heroui/button";
import { siteConfig } from "@/config/site";

export function LoginWarn() {
    return (
        <div className="items-center inline-block w-full gap-6 mb-8 text-center">
            <p className="font-serif text-lg text-red-500">Please login to Access All Features</p>
                <Button
                    showAnchorIcon
                    as={Link}
                    color="primary"
                    href={siteConfig.links.signin}
                    variant="light"
                >
                    Login
                </Button>
        </div>
    );
}