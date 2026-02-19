import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Trophy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostWithVote } from "@shared/schema";

interface UserProfileData {
  id: string;
  username: string;
  avatar: string;
  bio?: string;
  totalPosts: number;
  totalVotesReceived: number;
  createdAt: Date | string;
  posts: PostWithVote[];
}

const translations = {
  en: {
    userNotFound: "User not found",
    noPosts: "This user hasn't posted yet",
    totalPosts: "Total Posts",
    totalVotes: "Total Votes",
    joined: "Joined",
    confidence: "Confidence",
    detected: "Detected",
    upvote: "Helpful",
    downvote: "Not Helpful",
    score: "Score",
    play: "Play Sound",
  },
  zh: {
    userNotFound: "用户未找到",
    noPosts: "该用户还没有发布任何帖子",
    totalPosts: "总帖子数",
    totalVotes: "总投票数",
    joined: "加入时间",
    confidence: "置信度",
    detected: "检测到",
    upvote: "有用",
    downvote: "无用",
    score: "评分",
    play: "播放声音",
  }
};

const animalEmojis = {
  guinea_pig: '🐹',
  cat: '🐱',
  dog: '🐕',
};

export default function UserProfile() {
  const [pathname, navigate] = useLocation();
  const [language] = useState<'en' | 'zh'>('en');
  const t = translations[language];
  
  // Extract username from pathname
  const username = pathname.split('/').pop() || '';

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      const response = await fetch(`/api/users/${username}/profile`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('User not found');
      return response.json() as Promise<UserProfileData>;
    },
    enabled: !!username && username !== 'profile',
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{t.userNotFound}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const joinedDate = new Date(profile.createdAt).toLocaleDateString();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
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
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="text-6xl">{profile.avatar || '😊'}</div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{t.totalPosts}</span>
                  </div>
                  <p className="text-2xl font-bold">{profile.totalPosts}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">{t.totalVotes}</span>
                  </div>
                  <p className="text-2xl font-bold">{profile.totalVotesReceived}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{t.joined}</span>
                  </div>
                  <p className="text-sm font-medium">{joinedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User's Posts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{profile.username}'s Posts</h2>
        
        {profile.posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t.noPosts}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {profile.posts.map((post) => {
              const score = post.upvotes - post.downvotes;
              return (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                          {animalEmojis[post.animal as keyof typeof animalEmojis]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{post.animal.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={score > 0 ? "default" : "secondary"}>
                        {score}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{t.detected}</span>
                        {post.confidence && (
                          <span className="text-xs font-medium">
                            {t.confidence}: {post.confidence}%
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-lg">{post.soundType}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.interpretation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="flex items-center gap-1">
                        👍 {post.upvotes}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        👎 {post.downvotes}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
