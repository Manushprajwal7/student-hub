"use client";

import "./globals.css";
import { Providers } from "@/components/providers";
import MainNav from "@/components/main-nav";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="relative flex min-h-screen">
            <Sidebar />
            <div className="flex w-full flex-1 flex-col">
              <MainNav />
              <main className="flex-1 space-y-4 overflow-y-auto p-4 pt-20 pb-20 md:ml-56 md:pb-8 md:pt-20">
                {children}
              </main>
            </div>
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
