import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown, Trash2, Volume2, Clock, TrendingUp, Flag, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { PostWithVote } from "@shared/schema";
import guineaPigMascot from "@assets/generated_images/cute_guinea_pig_mascot_listening_with_headphones.png";
import catMascot from "@assets/generated_images/cute_cat_mascot_with_headphones.png";
import dogMascot from "@assets/generated_images/cute_dog_mascot_with_headphones.png";

interface CommunityFeedProps {
  language: 'en' | 'zh';
  animal: 'guinea_pig' | 'cat' | 'dog';
}

type SortOption = 'newest' | 'most_likes' | 'most_dislikes';

const translations = {
  en: {
    title: "Community Feed",
    empty: "No posts yet. Share your pet's sounds to get started!",
    confidence: "Confidence",
    detected: "Detected",
    upvote: "Helpful",
    downvote: "Not Helpful",
    delete: "Delete",
    report: "Report",
    favorite: "Favorite",
    unfavorite: "Unfavorite",
    favorited: "Saved to favorites",
    unfavorited: "Removed from favorites",
    reported: "Post reported",
    play: "Play Sound",
    justNow: "Just now",
    minutesAgo: (min: number) => `${min}m ago`,
    hoursAgo: (hrs: number) => `${hrs}h ago`,
    daysAgo: (days: number) => `${days}d ago`,
    score: "Score",
    sortBy: "Sort by",
    newest: "Newest",
    mostLikes: "Most Likes",
    mostDislikes: "Most Dislikes",
    loading: "Loading community posts...",
    errorLoading: "Failed to load posts",
    errorVoting: "Failed to vote",
    errorDeleting: "Failed to delete post",
    errorReporting: "Failed to report post",
    errorFavoriting: "Failed to update favorite",
    deleted: "Post deleted",
  },
  zh: {
    title: "社区动态",
    empty: "还没有帖子。分享您宠物的声音开始吧！",
    confidence: "置信度",
    detected: "检测到",
    upvote: "有用",
    downvote: "无用",
    delete: "删除",
    report: "举报",
    favorite: "收藏",
    unfavorite: "取消收藏",
    favorited: "已收藏",
    unfavorited: "已取消收藏",
    reported: "已举报帖子",
    play: "播放声音",
    justNow: "刚刚",
    minutesAgo: (min: number) => `${min}分钟前`,
    hoursAgo: (hrs: number) => `${hrs}小时前`,
    daysAgo: (days: number) => `${days}天前`,
    score: "评分",
    sortBy: "排序",
    newest: "最新",
    mostLikes: "最多赞",
    mostDislikes: "最多踩",
    loading: "加载社区帖子中...",
    errorLoading: "加载失败",
    errorVoting: "投票失败",
    errorDeleting: "删除失败",
    errorReporting: "举报失败",
    errorFavoriting: "收藏更新失败",
    deleted: "已删除帖子",
  }
};

const animalEmojis = {
  guinea_pig: '🐹',
  cat: '🐱',
  dog: '🐕',
};

const animalMascots = {
  guinea_pig: guineaPigMascot,
  cat: catMascot,
  dog: dogMascot,
};

function formatTimeAgo(date: Date, t: typeof translations.en): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t.justNow;
  if (diffMins < 60) return t.minutesAgo(diffMins);
  if (diffHours < 24) return t.hoursAgo(diffHours);
  return t.daysAgo(diffDays);
}

function PostCard({ post, language, onVote, onDelete, onPlay, onReport, onFavorite }: {
  post: PostWithVote;
  language: 'en' | 'zh';
  onVote: (postId: string, voteType: 'up' | 'down') => void;
  onDelete: (postId: string) => void;
  onPlay: (audioData: string) => void;
  onReport: (postId: string) => void;
  onFavorite: (postId: string) => void;
}) {
  const t = translations[language];
  const score = post.upvotes - post.downvotes;
  const hasAudio = !!post.audioData;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              {animalEmojis[post.animal as keyof typeof animalEmojis]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{post.username}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(post.createdAt, t)}
              </p>
            </div>
          </div>
          <Badge variant={score > 0 ? "default" : "secondary"} className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {score}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Sound info */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{t.detected}</span>
            {post.confidence && (
              <span className="text-xs font-medium">
                {t.confidence}: {post.confidence}%
              </span>
            )}
          </div>
          <p className="font-bold text-lg">
            {post.metadata?.soundName 
              ? post.metadata.soundName[language]
              : post.soundType}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {post.metadata?.allTranslations
              ? post.metadata.allTranslations[language]
              : post.interpretation}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {hasAudio && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPlay(post.audioData!)}
              className="gap-2"
              title={t.play}
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant={post.userVote === 'up' ? "default" : "outline"}
            size="sm"
            onClick={() => onVote(post.id, 'up')}
            className="flex-1"
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            {post.upvotes}
          </Button>
          
          <Button
            variant={post.userVote === 'down' ? "destructive" : "outline"}
            size="sm"
            onClick={() => onVote(post.id, 'down')}
            className="flex-1"
          >
            <ThumbsDown className="w-4 h-4 mr-1" />
            {post.downvotes}
          </Button>

          <Button
            variant={post.isFavorited ? "default" : "ghost"}
            size="sm"
            onClick={() => onFavorite(post.id)}
            className={post.isFavorited ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
            title={post.isFavorited ? t.unfavorite : t.favorite}
          >
            <Heart className={`w-4 h-4 ${post.isFavorited ? "fill-current" : ""}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReport(post.id)}
            className="text-muted-foreground hover:text-foreground"
            title={t.report}
          >
            <Flag className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunityFeed({ language, animal }: CommunityFeedProps) {
  const t = translations[language];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Initialize sortBy from localStorage, defaulting to 'newest'
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('community-feed-sort');
      if (saved === 'newest' || saved === 'most_likes' || saved === 'most_dislikes') {
        return saved;
      }
    }
    return 'newest';
  });

  useEffect(() => {
    localStorage.setItem('community-feed-sort', sortBy);
  }, [sortBy]);

  useEffect(() => {
    setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());
  }, []);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', animal],
    queryFn: async () => {
      const response = await fetch(`/api/posts?animal=${animal}&limit=50`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json() as Promise<PostWithVote[]>;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: string; voteType: 'up' | 'down' }) => {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to vote');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', animal] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
    onError: () => {
      toast({
        title: t.errorVoting,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', animal] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      toast({
        title: t.deleted,
      });
    },
    onError: () => {
      toast({
        title: t.errorDeleting,
        variant: "destructive",
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'inappropriate' }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to report');
      return response.json() as Promise<{ success: boolean; alreadyReported: boolean }>;
    },
    onSuccess: () => {
      toast({
        title: t.reported,
      });
    },
    onError: () => {
      toast({
        title: t.errorReporting,
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}/favorite`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to favorite');
      return response.json() as Promise<{ success: boolean; favorited: boolean }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts', animal] });
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
      toast({
        title: data.favorited ? t.favorited : t.unfavorited,
      });
    },
    onError: () => {
      toast({
        title: t.errorFavoriting,
        variant: "destructive",
      });
    },
  });

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
      console.error('Error playing audio:', error);
    }
  };

  const sortedPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    const sorted = [...posts];

    switch (sortBy) {
      case 'most_likes':
        sorted.sort((a, b) => {
          if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
      case 'most_dislikes':
        sorted.sort((a, b) => {
          if (a.downvotes !== b.downvotes) return b.downvotes - a.downvotes;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return sorted;
  }, [posts, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-display font-bold">{t.title}</h2>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-12 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t.errorLoading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mascot Header */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-primary/20">
          <img 
            src={animalMascots[animal]} 
            alt={`${animal} mascot`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold">{t.title}</h2>
          <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Badge variant="outline">
              {animalEmojis[animal]} {posts?.length || 0} {language === 'en' ? 'posts' : '帖子'}
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t.sortBy}</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder={t.newest} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t.newest}</SelectItem>
                  <SelectItem value="most_likes">{t.mostLikes}</SelectItem>
                  <SelectItem value="most_dislikes">{t.mostDislikes}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {!posts || posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.empty}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              language={language}
              onVote={(postId, voteType) => voteMutation.mutate({ postId, voteType })}
              onDelete={(postId) => deleteMutation.mutate(postId)}
              onPlay={playAudio}
              onReport={(postId) => reportMutation.mutate(postId)}
              onFavorite={(postId) => favoriteMutation.mutate(postId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
