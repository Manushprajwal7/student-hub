"use client";
import { ProfileCard } from "@/components/profile/profile-card";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Moon, Lock, User } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const { setTheme, theme } = useTheme();

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Moon className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Lock className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <ProfileCard />
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how Student Hub looks on your device.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <label className="text-base font-medium">Theme</label>
                      <p className="text-sm text-muted-foreground">
                        Select your preferred theme
                      </p>
                    </div>
                    <select
                      defaultValue={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-[180px] border rounded-lg p-2"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
                <CardDescription>
                  Information about how we handle your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose dark:prose-invert">
                  <p>
                    At Student Hub, we take your privacy seriously. Your data is
                    protected and encrypted, and we never share your personal
                    information with third parties without your explicit
                    consent.
                  </p>
                  <h4 className="text-lg font-semibold mt-4">
                    Data Protection
                  </h4>
                  <p>
                    All your personal information, including your profile
                    details, is stored securely using industry-standard
                    encryption protocols. We regularly update our security
                    measures to ensure your data remains protected.
                  </p>
                  <h4 className="text-lg font-semibold mt-4">Your Control</h4>
                  <p>You have complete control over your data. You can:</p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Access your personal information at any time</li>
                    <li>Request data modification or deletion</li>
                    <li>Opt out of any non-essential data collection</li>
                  </ul>
                  <p className="mt-4">
                    For any privacy-related concerns or requests, please contact
                    the developer. We're committed to maintaining the trust you
                    place in us by being transparent about our data practices
                    and responding promptly to your privacy needs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Developer Message Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>About Student Hub</CardTitle>
          <CardDescription>A message from the developer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Student Hub was built with the vision of creating a unified platform
            for all students of our college. This platform serves as a central
            interface where students can share resources, discuss issues, find
            opportunities, and build a stronger community.
          </p>
          <p className="text-muted-foreground">
            I encourage you to use this platform responsibly and contribute
            positively to our college community. Share knowledge, help others,
            and make the most of the resources available here. Remember, the
            strength of this platform lies in the active participation and
            goodwill of every student.
          </p>
          <p className="text-muted-foreground">
            I belive Together we can make our college experience more enriching
            and collaborative. Let's use this platform to support each other's
            growth and success.
          </p>
          <p className="text-muted-foreground">
            This appliocation is completelly open source. and any form of
            contribution is ecnouraged .
          </p>
          <div className="pt-4 border-t">
            <a
              href="https://manushpotfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-2"
            >
              <h2 className="h-4 w-4" />
              Know more about the developer
            </a>
          </div>
          <div className="py-2 text-center text-m text-muted-foreground">
            Made with ❤️ ManushPrajwal
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
