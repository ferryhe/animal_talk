import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

export default function Mods() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lockedByOther, setLockedByOther] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [notMod, setNotMod] = useState(false);
  const [newModUsername, setNewModUsername] = useState("");
  const [banUsername, setBanUsername] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banType, setBanType] = useState<"permanent" | "temporary">("permanent");
  const [banDurationDays, setBanDurationDays] = useState("7");

  const loadStatus = async () => {
    try {
      const response = await fetch("/api/mod/status", {
        credentials: "include",
      });

      if (!response.ok) return;
      const data = await response.json();
      setIsUnlocked(!!data.unlocked);
      setLockedByOther(!!data.lockedByOther);
      setNeedsLogin(!!data.needsLogin);
      setNotMod(!!data.notMod);
    } catch {
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;

    const sendHeartbeat = async () => {
      try {
        const response = await fetch("/api/mod/heartbeat", {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          setIsUnlocked(false);
        }
      } catch {
      }
    };

    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, 10000);

    const onBeforeUnload = () => {
      navigator.sendBeacon("/api/mod/lock");
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [isUnlocked]);

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ["mod-reports"],
    queryFn: async () => {
      const response = await fetch("/api/mod/reports", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          await loadStatus();
        }
        throw new Error("Failed to load reports");
      }

      return response.json() as Promise<{
        posts: Array<{
          postId: string;
          reportCount: number;
          lastReportedAt: string;
          post: {
            id: string;
            username: string;
            soundType: string;
            interpretation: string;
          } | null;
        }>;
        messages: Array<{
          commentId: string;
          reportCount: number;
          lastReportedAt: string;
          comment: {
            id: string;
            postId: string;
            username: string;
            text: string;
          } | null;
        }>;
      }>;
    },
    enabled: isUnlocked,
  });

  const { data: currentUserData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!response.ok) return null;
      return response.json();
    },
  });

  const { data: modsList, refetch: refetchMods } = useQuery({
    queryKey: ["mod-list"],
    queryFn: async () => {
      const response = await fetch("/api/mod/list", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load mod list");
      return response.json() as Promise<{ mods: string[] }>;
    },
    enabled: isUnlocked,
  });

  const { data: postsData = [] } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load posts");
      return response.json() as Promise<any[]>;
    },
    enabled: isUnlocked,
  });

  const addModMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch("/api/mod/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Failed to add mod" }));
        throw new Error(err.error || "Failed to add mod");
      }
      return response.json();
    },
    onSuccess: () => {
      setNewModUsername("");
      refetchMods();
      toast({ title: "Mod added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: error.message || "Failed to add mod",
        variant: "destructive",
      });
    },
  });

  const removeModMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch("/api/mod/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Failed to remove mod" }));
        throw new Error(err.error || "Failed to remove mod");
      }
      return response.json();
    },
    onSuccess: () => {
      refetchMods();
      toast({ title: "Mod removed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: error.message || "Failed to remove mod",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/mod/delete-post/${postId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
      toast({ title: "Post deleted" });
    },
    onError: () => {
      toast({
        title: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/mod/delete-comment/${commentId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
      toast({ title: "Comment deleted" });
    },
    onError: () => {
      toast({
        title: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const banMutation = useMutation({
    mutationFn: async () => {
      if (!banUsername) {
        throw new Error("Username is required");
      }

      const response = await fetch("/api/mod/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: banUsername,
          reason: banReason,
          banType: banType,
          durationDays: banType === "temporary" ? parseInt(banDurationDays) || 1 : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to ban user" }));
        throw new Error(error.error || "Failed to ban user");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User banned successfully",
        description: `${banUsername} has been ${banType === "temporary" ? "suspended for " + banDurationDays + " days" : "permanently banned"}`,
      });
      setBanUsername("");
      setBanReason("");
      setBanType("permanent");
      setBanDurationDays("7");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to ban user",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/mod/unban-user/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to unban user" }));
        throw new Error(error.error || "Failed to unban user");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User unbanned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unban user",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleUnlock = async () => {
    try {
      const response = await fetch("/api/mod/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to unlock" }));
        if (response.status === 403) {
          setNotMod(true);
        }
        toast({
          title: data.error || "Failed to unlock",
          variant: "destructive",
        });
        return;
      }

      setIsUnlocked(true);
      setLockedByOther(false);
      setNeedsLogin(false);
      setNotMod(false);
      setPassword("");
      toast({ title: "Mod access granted" });
    } catch {
      toast({
        title: "Failed to unlock mod access",
        variant: "destructive",
      });
    }
  };

  const handleLock = async () => {
    await fetch("/api/mod/lock", {
      method: "POST",
      credentials: "include",
    });
    setIsUnlocked(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Mod Area</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isUnlocked ? (
            <>
              <p className="text-sm text-muted-foreground">
                This place is for mods only. Enter the password to continue.
              </p>
              {needsLogin && (
                <p className="text-sm text-destructive">Please sign in first.</p>
              )}
              {notMod && (
                <p className="text-sm text-destructive">This account is not a mod.</p>
              )}
              {lockedByOther && (
                <p className="text-sm text-destructive">Another mod account is active right now.</p>
              )}
              <Input
                type="password"
                placeholder="Enter mod password"
                value={password}
                disabled={needsLogin || lockedByOther || notMod}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUnlock();
                }}
              />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleUnlock} disabled={needsLogin || lockedByOther || notMod}>
                  Unlock
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm">
                Welcome, moderator. This area is restricted.
              </p>
              
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-semibold text-sm">Manage Moderators</h3>
                <div className="space-y-2">
                  {modsList?.mods.length ? (
                    <div className="space-y-1">
                      {modsList.mods.map((mod) => {
                        const isCurrentUser = currentUserData?.username.toLowerCase() === mod.toLowerCase();
                        return (
                          <div key={mod} className="flex items-center justify-between gap-2 p-2 rounded border border-border/50">
                            <span className="text-sm">{mod}{isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(you)</span>}</span>
                            {modsList.mods.length > 1 && !isCurrentUser && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeModMutation.mutate(mod)}
                                disabled={removeModMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No mods configured.</p>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Username to add as mod"
                    value={newModUsername}
                    onChange={(e) => setNewModUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newModUsername.trim()) {
                        addModMutation.mutate(newModUsername);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => addModMutation.mutate(newModUsername)}
                    disabled={!newModUsername.trim() || addModMutation.isPending}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <h3 className="font-semibold text-sm">Ban/Suspend Users</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Username to ban"
                    value={banUsername}
                    onChange={(e) => setBanUsername(e.target.value)}
                  />
                  <Input
                    placeholder="Reason for ban"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="banType"
                        value="permanent"
                        checked={banType === "permanent"}
                        onChange={(e) => setBanType(e.target.value as "permanent" | "temporary")}
                      />
                      Permanent Ban
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="banType"
                        value="temporary"
                        checked={banType === "temporary"}
                        onChange={(e) => setBanType(e.target.value as "permanent" | "temporary")}
                      />
                      Temporary Suspension
                    </label>
                  </div>
                  {banType === "temporary" && (
                    <Input
                      type="number"
                      placeholder="Duration (days)"
                      value={banDurationDays}
                      onChange={(e) => setBanDurationDays(e.target.value)}
                      min="1"
                      max="365"
                    />
                  )}
                  <Button
                    onClick={() => banMutation.mutate()}
                    disabled={!banUsername.trim() || !banReason.trim() || banMutation.isPending}
                    className="w-full"
                  >
                    {banMutation.isPending ? "Banning..." : "Ban User"}
                  </Button>
                </div>
              </div>
              {reportsLoading ? (
                <p className="text-sm text-muted-foreground">Loading reports...</p>
              ) : (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-sm">Reported Content</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Reported Posts</h3>
                      {reportsData?.posts.length ? (
                        <div className="space-y-2">
                          {reportsData.posts.map((item) => (
                            <div key={item.postId} className="rounded-md border p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium truncate flex-1">
                                  {item.post?.username || "Unknown"} - {item.post?.soundType || "Deleted post"}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive">{item.reportCount}x</Badge>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deletePostMutation.mutate(item.postId)}
                                    disabled={deletePostMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {item.post?.interpretation || "Post no longer exists"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No reported posts.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Reported Messages</h3>
                      {reportsData?.messages.length ? (
                        <div className="space-y-2">
                          {reportsData.messages.map((item) => (
                            <div key={item.commentId} className="rounded-md border p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium truncate flex-1">
                                  {item.comment?.username || "Unknown"}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive">{item.reportCount}x</Badge>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteCommentMutation.mutate(item.commentId)}
                                    disabled={deleteCommentMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {item.comment?.text || "Message no longer exists"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No reported messages.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              

              <div className="flex gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLock}
                >
                  Lock
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
