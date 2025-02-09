"use client";

import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        <AuthForm /> {/* Removed type="login" since it's no longer needed */}
      </CardContent>
      <CardFooter>
        <p>
          Don't have an account?{" "}
          <Link href="/signup">
            <Button variant="link">Sign up</Button>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in
          </p>
        </div>
        <LoginContent /> {/* Fixed from LoginForm to LoginContent */}
      </div>
    </div>
  );
}
