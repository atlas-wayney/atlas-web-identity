'use client';
import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from "@heroui/react";
import { NavbarLogoBrand, ThemeToggle, NavbarUserMenu } from "atlas-shared-web/components";
import { useAuth } from "atlas-shared-web";
import { API_BASE } from "../lib/config";

const authApiPath = "/identity/auth/v1";
const loginPath = "/auth/login";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const menuItems = [
    { label: "Dashboard", href: "/" },
    { label: "Access Matrix", href: "/access-matrix" },
    { label: "Clients", href: "/clients" },
    { label: "Subclients", href: "/subclients" },
    { label: "Users", href: "/users" },
    { label: "Configs", href: "/configs" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return router.pathname === "/";
    }
    return router.pathname.startsWith(href);
  };

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} maxWidth="full" isBordered={true} shouldHideOnScroll={true} classNames={{ wrapper: "px-4" }}>
      <NavbarContent>
        {user && (
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
        )}
        <NavbarBrand>
          <NavbarLogoBrand />
        </NavbarBrand>
      </NavbarContent>

      {/* Global Navigation Items */}
      {user && (
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.href} isActive={isActive(item.href)}>
              <Button
                variant="light"
                className={`p-0 px-2 min-w-fit bg-transparent data-[hover=true]:bg-transparent data-[hover=true]:text-primary text-base transition-colors ${isActive(item.href) ? "text-primary font-semibold" : ""}`}
                onPress={() => router.push(item.href)}
              >
                {item.label}
              </Button>
            </NavbarItem>
          ))}
        </NavbarContent>
      )}

      <NavbarContent justify="end" className="gap-2">
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>
        <NavbarItem>
          <NavbarUserMenu user={user} />
          {/* <NavbarUserMenu2 /> */}
        </NavbarItem>
      </NavbarContent>

      {user && (
        <NavbarMenu>
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`} isActive={isActive(item.href)}>
              <Link
                as={NextLink}
                color={isActive(item.href) ? "primary" : "foreground"}
                className={`w-full ${isActive(item.href) ? "font-semibold" : ""}`}
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      )}
    </Navbar>
  );
}
