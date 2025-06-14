"use client";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  Navbar,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/config/icons";
import { title } from "@/components/primitives";
import { Avatar } from "@heroui/avatar";
import { Tab, Tabs } from "@heroui/tabs";
import { BellDotIcon, BellElectricIcon, HomeIcon, TrendingUpIcon, UploadIcon } from "lucide-react";

export const UpperNavbar = () => {

  return (
    <Navbar maxWidth="full" position="sticky" isBordered className="py-0 mb-0" >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <p className={title({ size: "sm", color: "pink" })}>
              Loopz
            </p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="flex gap-4">
          <ThemeSwitch />
          <Avatar size="md" showFallback src="https://images.unsplash.com/broken" />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export const LowerNavbar = () => {
  return (
    <Navbar maxWidth="full" position="sticky" className="px-0 pb-4 pt-0">
      <NavbarContent justify="center" className="w-full px-4">
        <Tabs
          aria-label="Navigation tabs"
          color="primary"
          radius="md"
          className="w-full max-w-4xl"
          classNames={{
            tabList: "w-full grid grid-cols-4",
            tab: "w-full px-2",
            cursor: "w-full"
          }}
        >
          <Tab key="Explore" title={
            <div className=" flex items-center space-x-2">
              <TrendingUpIcon />
              <span className="hidden md:inline">Explore</span>
            </div>
          } />
          <Tab key="home" title={
            <div className=" flex items-center space-x-2">
              <HomeIcon />
              <span className="hidden md:inline">Home</span>
            </div>
          } />
          <Tab key="Post" title={
            <div className=" flex items-center space-x-2">
              <UploadIcon />
              <span className="hidden md:inline">Post</span>
            </div>
          } />
          <Tab key="Notification" title={
            <div className=" flex items-center space-x-2">
              <BellDotIcon />
              <span className="hidden md:inline">Notification</span>
            </div>
          } />
        </Tabs>
      </NavbarContent>
    </Navbar >
  )
}
