"use client";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  Navbar,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import NextLink from "next/link";
import { ThemeSwitch } from "@/components/theme-switch";
import { title } from "@/components/primitives";
import { Avatar } from "@heroui/avatar";
import { Tab, Tabs } from "@heroui/tabs";
import { BellDotIcon, BellElectricIcon, HomeIcon, TrendingUpIcon, UploadIcon, LogIn, LogOut, Eye, EyeOff, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export const UpperNavbar = () => {
  const { data: session, status } = useSession();
  const isCelebrity = session?.user?.role === 'CELEBRITY';
  const user = session?.user;
  const isLoggedIn = status === 'authenticated';

  const handleAuthAction = () => {
    if (isLoggedIn) {
      signOut();
    } else {
      signIn();
    }
  };

  const handleViewPosts = () => {
    // Navigate to view posts page
    window.location.href = '/celebrities/posts';
  };

  return (
    <Navbar maxWidth="full" position="sticky" isBordered className="py-0 mb-0" >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li">
          <NextLink className="flex items-center justify-start gap-1" href="/">
            <p className={title({ size: "sm", color: "pink" })}>
              Loopz
            </p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="flex gap-4">
          <ThemeSwitch />

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                size="md"
                showFallback
                src={user?.image || "https://i.pinimg.com/736x/cd/d9/76/cdd97628928661edc4902fa9d97342c5.jpg"}
                className="cursor-pointer"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu actions">
              <DropdownItem
                key="auth"
                startContent={isLoggedIn ? <LogOut size={16} /> : <LogIn size={16} />}
                onPress={handleAuthAction}
              >
                {isLoggedIn ? 'Logout' : 'Login'}
              </DropdownItem>
              <DropdownItem key={"view post"}>
                <Button
                  isDisabled={!isCelebrity}
                  onPress={handleViewPosts}
                >
                  {isCelebrity ? <Eye size={16} /> : <EyeOff size={16} />}view Posts
                </Button>
              </DropdownItem>

            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export const LowerNavbar = () => {
  return (
    <Navbar maxWidth="full" position="sticky" className="px-0 pt-0 pb-4">
      <NavbarContent justify="center" className="w-full px-4">
        <Tabs
          aria-label="Navigation tabs"
          color="primary"
          radius="md"
          className="w-full max-w-4xl"
          classNames={{
            tabList: "w-full grid grid-cols-5",
            tab: "w-full px-2",
            cursor: "w-full"
          }}
        >
          <Tab key="Explore" title={
            <div className="flex items-center space-x-2 ">
              <Link href={"/"}>
                <TrendingUpIcon />
              </Link>
            </div>
          } />
          <Tab key="home" title={
            <Link href={"/feed"}>
              <div className="flex items-center space-x-2 ">
                <HomeIcon />
                <span className="hidden md:inline">Home</span>
              </div>
            </Link>
          } />
          <Tab key="Post" title={
            <Link href={"/post"}>
              <div className="flex items-center space-x-2 ">
                <UploadIcon />
                <span className="hidden md:inline">Post</span>
              </div>
            </Link>
          } />
          <Tab key="Notification" title={
            <Link href={"/"}>
              <div className="flex items-center space-x-2 ">
                <BellDotIcon />
                <span className="hidden md:inline">Notification</span>
              </div>
            </Link>
          } />
          <Tab key="Users" title={
            <Link href={"/celebrities"}>
              <div className="flex items-center space-x-2 ">
                <User />
                <span className="hidden md:inline">Celebrties</span>
              </div>
            </Link>
          } />
        </Tabs>
      </NavbarContent>
    </Navbar >
  )
}