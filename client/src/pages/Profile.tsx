import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { LogOut, Calendar, ArrowLeft, Volume2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { PostWithVote } from "@shared/schema";

export function Profile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    },
    retry: false,
  });

  // Fetch user's posts
  const { data: userPosts = [] } = useQuery({
    queryKey: ['userPosts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/posts`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: favoritePosts = [] } = useQuery({
    queryKey: ['userFavorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/favorites`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return response.json() as Promise<PostWithVote[]>;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());
  }, []);

  const playAudio = async (base64Audio: string) => {
    if (!audioContext) return;

    try {
      const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
      const audioBuffer = await audioContext.decodeAudioData(audioData.buffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      toast({
        title: "Failed to play audio",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setCurrentUser(null);
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (!currentUser && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Not Logged In</h1>
        <p className="text-gray-500">Please login to view your profile</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="gap-2 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Button>

      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{currentUser.avatar}</div>
            <div>
              <h1 className="text-3xl font-bold">{currentUser.username}</h1>
              <p className="text-gray-500">{currentUser.bio || "No bio yet"}</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{currentUser.totalPosts}</p>
            <p className="text-sm text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{currentUser.totalVotesReceived}</p>
            <p className="text-sm text-gray-500">Votes Received</p>
          </div>
          <div className="text-center">
            <Badge>{Math.max(currentUser.totalVotesReceived / 10, 0).toFixed(0)} Karma</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Member Since */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Member Since
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{new Date(currentUser.createdAt).toLocaleDateString()}</p>
        </CardContent>
      </Card>

      {/* User's Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Posts ({userPosts.length})</h2>
        {userPosts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              You haven't posted any sounds yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post: any) => (
              <Card key={post.id}>
                <CardContent className="py-4">
                  <p className="text-sm text-gray-500">{post.animal}</p>
                  <p className="font-semibold">{post.soundType}</p>
                  <p className="text-sm">{post.interpretation}</p>
                  <div className="flex gap-4 mt-2">
                    <Badge variant="secondary">👍 {post.upvotes}</Badge>
                    <Badge variant="secondary">👎 {post.downvotes}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Favorites */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6" />
          Your Favorites ({favoritePosts.length})
        </h2>
        {favoritePosts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              You haven't favorited any posts yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {favoritePosts.map((post: PostWithVote) => (
              <Card key={post.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm text-gray-500">{post.animal} · {post.username}</p>
                      <p className="font-semibold">{post.soundType}</p>
                    </div>
                    {post.audioData && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playAudio(post.audioData!)}
                        className="gap-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        Listen
                      </Button>
                    )}
                  </div>
                  <p className="text-sm">{post.interpretation}</p>
                  <div className="flex gap-4 mt-2">
                    <Badge variant="secondary">👍 {post.upvotes}</Badge>
                    <Badge variant="secondary">👎 {post.downvotes}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
