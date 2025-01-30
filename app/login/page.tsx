"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Enter your email and password to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm type="login" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
