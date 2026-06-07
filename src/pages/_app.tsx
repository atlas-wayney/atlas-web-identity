'use client';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { Metadata } from 'next';

import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { openSansLocal } from "@/styles/fonts/opensans";
import AppNavbar from "@/components/navbar";
import { AuthProvider, AuthSessionManager } from "atlas-shared-web";


ModuleRegistry.registerModules([AllCommunityModule]);

export const metadata: Metadata = {
  title: 'Atlas', // This will be the title of your page
  description: 'Atlas - Internal operations platform',
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${openSansLocal.className}`}>
      <HeroUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AuthSessionManager />
            <AppNavbar />
            <Component {...pageProps} />
          </AuthProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </main>
  );
}
