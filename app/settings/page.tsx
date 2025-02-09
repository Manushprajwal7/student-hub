"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Globe, Lock, Moon, User } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { PageTransition } from "@/components/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "next-themes";

const settingsFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  language: z.string(),
  email_notifications: z.boolean(),
  marketing_emails: z.boolean(),
  theme_preference: z.string(),
  profile_visibility: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const { setTheme, theme } = useTheme();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      full_name: "",
      language: "en",
      email_notifications: true,
      marketing_emails: false,
      theme_preference: "system",
      profile_visibility: true,
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          settings: {
            language: data.language,
            email_notifications: data.email_notifications,
            marketing_emails: data.marketing_emails,
            theme_preference: data.theme_preference,
            profile_visibility: data.profile_visibility,
          },
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <TabsContent value="account" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
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
                        <Select
                          defaultValue={theme}
                          onValueChange={(value) => setTheme(value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
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
                        At Student Hub, we take your privacy seriously. Your
                        data is protected and encrypted, and we never share your
                        personal information with third parties without your
                        explicit consent.
                      </p>
                      <h4 className="text-lg font-semibold mt-4">
                        Data Protection
                      </h4>
                      <p>
                        All your personal information, including your profile
                        details and academic records, is stored securely using
                        industry-standard encryption protocols. We regularly
                        update our security measures to ensure your data remains
                        protected.
                      </p>
                      <h4 className="text-lg font-semibold mt-4">
                        Your Control
                      </h4>
                      <p>You have complete control over your data. You can:</p>
                      <ul className="list-disc pl-6 mt-2">
                        <li>Access your personal information at any time</li>
                        <li>Request data modification or deletion</li>
                        <li>
                          Choose what information to share with other users
                        </li>
                        <li>Opt out of any non-essential data collection</li>
                      </ul>
                      <p className="mt-4">
                        For any privacy-related concerns or requests, please
                        contact our support team. We're committed to maintaining
                        the trust you place in us by being transparent about our
                        data practices and responding promptly to your privacy
                        needs.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </Tabs>

        {/* Developer Message Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Student Hub</CardTitle>
            <CardDescription>A message from the developer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Student Hub was built with the vision of creating a unified
              platform for all students of our college. This platform serves as
              a central interface where students can share resources, discuss
              issues, find opportunities, and build a stronger community.
            </p>
            <p className="text-muted-foreground">
              I encourage you to use this platform responsibly and contribute
              positively to our college community. Share knowledge, help others,
              and make the most of the resources available here. Remember, the
              strength of this platform lies in the active participation and
              goodwill of every student.
            </p>
            <p className="text-muted-foreground">
              I belive Together we can make our college experience more
              enriching and collaborative. Let's use this platform to support
              each other's growth and success.
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
                <Globe className="h-4 w-4" />
                Know more about the developer
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
