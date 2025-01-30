"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  LifeBuoy,
  Megaphone,
  School,
  Users2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { PageTransition } from "@/components/page-transition";

interface Stats {
  issues: number;
  events: number;
  announcements: number;
  resources: number;
  jobs: number;
  studyGroups: number;
  scholarships: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    issues: 0,
    events: 0,
    announcements: 0,
    resources: 0,
    jobs: 0,
    studyGroups: 0,
    scholarships: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [
          { count: issuesCount },
          { count: eventsCount },
          { count: announcementsCount },
          { count: resourcesCount },
          { count: jobsCount },
          { count: studyGroupsCount },
          { count: scholarshipsCount },
        ] = await Promise.all([
          supabase.from("issues").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase
            .from("announcements")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("resources")
            .select("*", { count: "exact", head: true }),
          supabase.from("jobs").select("*", { count: "exact", head: true }),
          supabase
            .from("study_groups")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("scholarships")
            .select("*", { count: "exact", head: true }),
        ]);

        setStats({
          issues: issuesCount || 0,
          events: eventsCount || 0,
          announcements: announcementsCount || 0,
          resources: resourcesCount || 0,
          jobs: jobsCount || 0,
          studyGroups: studyGroupsCount || 0,
          scholarships: scholarshipsCount || 0,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };

    loadStats();
  }, []);

  const statItems = [
    {
      id: "issues",
      title: "Active Issues",
      description: "Currently open issues",
      value: stats.issues.toString(),
      icon: LifeBuoy,
      href: "/issues",
    },
    {
      id: "events",
      title: "Upcoming Events",
      description: "Events this week",
      value: stats.events.toString(),
      icon: Calendar,
      href: "/events",
    },
    {
      id: "announcements",
      title: "Announcements",
      description: "Recent announcements",
      value: stats.announcements.toString(),
      icon: Megaphone,
      href: "/announcements",
    },
    {
      id: "resources",
      title: "Learning Resources",
      description: "Available study materials",
      value: stats.resources.toString(),
      icon: BookOpen,
      href: "/resources",
    },
    {
      id: "jobs",
      title: "Job Opportunities",
      description: "Available positions",
      value: stats.jobs.toString(),
      icon: GraduationCap,
      href: "/jobs",
    },
    {
      id: "study-groups",
      title: "Study Groups",
      description: "Active study sessions",
      value: stats.studyGroups.toString(),
      icon: Users2,
      href: "/study-groups",
    },
    {
      id: "scholarships",
      title: "Scholarships",
      description: "Available scholarships",
      value: stats.scholarships.toString(),
      icon: School,
      href: "/scholarships",
    },
  ];

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        <section className="space-y-6 pb-4 pt-4 md:pb-8 md:pt-6 lg:py-24">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Welcome to Student Hub
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Your one-stop platform for academic collaboration, resources, and
              community engagement.
            </p>
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href="/study-groups">Join Study Groups</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/resources">Browse Resources</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container space-y-0 py-0 md:py-1 lg:py-0">
          <div className="mx-auto grid gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:grid-cols-4">
            {statItems.map((stat) => (
              <Card
                key={stat.id}
                className="transition-colors hover:bg-muted/50"
              >
                <Link href={stat.href}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <stat.icon className="h-5 w-5" />
                      {stat.title}
                    </CardTitle>
                    <CardDescription>{stat.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
