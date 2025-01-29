"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login | Student Hub",
  description: "Login to your account",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            {redirectedFrom
              ? "Please sign in to continue to your destination"
              : "Enter your email and password to sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="login" />
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button variant="link" className="p-0" asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
