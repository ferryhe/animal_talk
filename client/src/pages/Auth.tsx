import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Auth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("login");

  // Login form
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const loginMutation = useMutation({
    mutationFn: async (data: typeof loginData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Login failed" }));
        throw new Error(errorData.error || "Login failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate("/profile");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Signup form
  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    bio: "",
    avatar: "🐹",
  });
  const signupMutation = useMutation({
    mutationFn: async (data: typeof signupData) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Signup failed" }));
        throw new Error(errorData.error || "Signup failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({
        title: "Account created",
        description: "Welcome to Animal Talk!",
      });
      navigate("/profile");
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl">🐾 Animal Talk</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  placeholder="Enter your username"
                  value={loginData.username}
                  onChange={(e) =>
                    setLoginData({ ...loginData, username: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={() => loginMutation.mutate(loginData)}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  placeholder="Choose a username"
                  value={signupData.username}
                  onChange={(e) =>
                    setSignupData({ ...signupData, username: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bio (optional)</label>
                <Input
                  placeholder="Tell us about yourself"
                  value={signupData.bio}
                  onChange={(e) =>
                    setSignupData({ ...signupData, bio: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Avatar Emoji</label>
                <Input
                  placeholder="Pick an emoji"
                  value={signupData.avatar}
                  onChange={(e) =>
                    setSignupData({ ...signupData, avatar: e.target.value })
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={() => signupMutation.mutate(signupData)}
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Creating account..." : "Sign Up"}
              </Button>
            </TabsContent>
          </Tabs>

          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
