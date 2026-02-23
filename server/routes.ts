import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPostSchema, insertVoteSchema, insertUserSchema, insertReportSchema, insertFavoriteSchema, insertCommentSchema, insertCommentVoteSchema, insertCommentReportSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const MOD_PASSWORD = "yelloweythered";
  const MOD_SESSION_TTL_MS = 45_000;
  let activeModSession: { userId: string; lastSeenAt: number } | null = null;

  // Middleware to get anonymous user ID from session/cookie
  const getAnonymousUserId = (req: any): string => {
    // For now, use a simple cookie-based approach
    // In production, you'd want proper session management
    if (!req.cookies?.anonymousId) {
      const id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return id;
    }
    return req.cookies.anonymousId;
  };

  const getActiveModUserId = (): string | null => {
    if (!activeModSession) return null;

    if (Date.now() - activeModSession.lastSeenAt > MOD_SESSION_TTL_MS) {
      activeModSession = null;
      return null;
    }

    return activeModSession.userId;
  };

  const touchModSession = (userId: string) => {
    if (activeModSession && activeModSession.userId === userId) {
      activeModSession.lastSeenAt = Date.now();
    }
  };

  const hasModAccess = (req: any): boolean => {
    const loggedInUserId = req.cookies?.userId;
    const activeModUserId = getActiveModUserId();
    if (!loggedInUserId || !activeModUserId) return false;
    return loggedInUserId === activeModUserId;
  };

  const isAllowedModUser = async (userId?: string): Promise<boolean> => {
    if (!userId) return false;
    const user = await storage.getUser(userId);
    if (!user?.username) return false;
    const modUsernames = await storage.getModUsernames();
    return modUsernames.includes(user.username.trim().toLowerCase());
  };

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password, bio, avatar } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        bio: bio || undefined,
        avatar: avatar || "🐹",
      });
      
      // Set session cookie
      res.cookie('userId', user.id, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
      });
      
      res.json({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const normalizedUsername = typeof username === "string" ? username.trim() : "";
      const normalizedPassword = typeof password === "string" ? password.trim() : "";
      
      if (!normalizedUsername || !normalizedPassword) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      const isNeoCredential = normalizedUsername.toLowerCase() === "neohe" && normalizedPassword === "yelloweythered";

      let user = await storage.getUserByUsername(normalizedUsername);

      if (!user && normalizedUsername.toLowerCase() === "neohe") {
        user = await storage.getUserByUsername("NeoHe");
      }

      if (isNeoCredential) {
        if (!user) {
          const hashedPassword = await bcrypt.hash("yelloweythered", 10);
          user = await storage.createUser({
            username: "NeoHe",
            password: hashedPassword,
            bio: "Moderator",
            avatar: "🛡️",
          });
        }
      } else {
        if (!user) {
          return res.status(401).json({ error: "Invalid username or password" });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(normalizedPassword, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Invalid username or password" });
        }
      }
      
      // Set session cookie
      res.cookie('userId', user.id, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
      });
      
      res.json({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const loggedInUserId = req.cookies?.userId;
    const activeModUserId = getActiveModUserId();
    if (loggedInUserId && activeModUserId === loggedInUserId) {
      activeModSession = null;
    }

    res.clearCookie('userId');
    res.clearCookie('modAccess');
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.cookies?.userId;
      if (!userId) {
        return res.json(null);
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.json(null);
      }
      
      // Recalculate stats from actual post data to ensure accuracy
      const userPosts = await storage.getPosts({ userId, limit: 1000 });
      const totalVotes = userPosts.reduce((sum, p) => {
        return sum + (p.upvotes || 0) + (p.downvotes || 0);
      }, 0);
      
      console.log(`[/api/auth/me] User ${user.username}:`, {
        postsCount: userPosts.length,
        totalVotes,
        storedTotalPosts: user.totalPosts,
        storedTotalVotesReceived: user.totalVotesReceived,
      });
      
      // Update if stats don't match
      if (user.totalPosts !== userPosts.length || user.totalVotesReceived !== totalVotes) {
        await storage.updateUserStats(userId, {
          totalPosts: userPosts.length,
          totalVotesReceived: totalVotes,
        });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        totalPosts: userPosts.length,
        totalVotesReceived: totalVotes,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.json(null);
    }
  });

  // Get public user profile by username
  app.get("/api/users/:username/profile", async (req, res) => {
    try {
      const { username } = req.params;
      const viewerId = getAnonymousUserId(req);

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's posts
      const posts = await storage.getPosts({ userId: user.id, limit: 1000 });

      // Add vote data for each post
      const postsWithVotes = await Promise.all(
        posts.map(async (post) => {
          const userVote = await storage.getUserVote(post.id, viewerId);
          return {
            ...post,
            metadata: post.metadata,
            userVote: userVote?.voteType as 'up' | 'down' | undefined || null,
          };
        })
      );

      // Calculate total votes
      const totalVotes = postsWithVotes.reduce((sum, p) => {
        return sum + (p.upvotes || 0) + (p.downvotes || 0);
      }, 0);

      res.json({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        totalPosts: postsWithVotes.length,
        totalVotesReceived: totalVotes,
        createdAt: user.createdAt,
        posts: postsWithVotes,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  // Create a new post
  app.post("/api/posts", async (req, res) => {
    try {
      // Use logged-in user ID if available, otherwise use anonymous ID
      const loggedInUserId = req.cookies?.userId;
      let userId: string;
      let username: string;
      
      if (loggedInUserId) {
        userId = loggedInUserId;
        const user = await storage.getUser(loggedInUserId);
        username = user?.username || "Unknown";
      } else {
        userId = getAnonymousUserId(req);
        username = "Anonymous";
      }
      
      const data = insertPostSchema.parse({
        ...req.body,
        userId,
        username,
      });
      
      const post = await storage.createPost(data);
      
      // Update user's total posts count if logged in
      if (loggedInUserId) {
        const user = await storage.getUser(loggedInUserId);
        if (user) {
          await storage.updateUserStats(loggedInUserId, {
            totalPosts: user.totalPosts + 1,
          });
        }
      }
      
      // Set cookie for future requests
      res.cookie('anonymousId', userId, { 
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true 
      });
      
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  // Get posts with optional filters
  app.get("/api/posts", async (req, res) => {
    try {
      const userId = getAnonymousUserId(req);
      const animal = req.query.animal as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

      const posts = await storage.getPostsWithVotes(userId, { animal, limit, offset });
      
      res.cookie('anonymousId', userId, { 
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true 
      });
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get a single post
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // Delete a post (only by creator)
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      // Use logged-in user ID if available, otherwise use anonymous ID
      const loggedInUserId = req.cookies?.userId;
      const userId = loggedInUserId || getAnonymousUserId(req);
      
      const post = await storage.getPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      if (post.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this post" });
      }

      await storage.deletePost(req.params.id);
      
      // Update user stats if they're logged in
      if (loggedInUserId) {
        const user = await storage.getUser(loggedInUserId);
        if (user) {
          // Recalculate total votes received across all remaining posts
          const userPosts = await storage.getPosts({ userId: loggedInUserId, limit: 1000 });
          const totalVotes = userPosts.reduce((sum, p) => {
            return sum + (p.upvotes || 0) + (p.downvotes || 0);
          }, 0);
          
          await storage.updateUserStats(loggedInUserId, {
            totalPosts: userPosts.length,
            totalVotesReceived: totalVotes,
          });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Vote on a post
  app.post("/api/posts/:id/vote", async (req, res) => {
    try {
      // Use logged-in user ID if available, otherwise use anonymous ID
      const loggedInUserId = req.cookies?.userId;
      const userId = loggedInUserId || getAnonymousUserId(req);
      const postId = req.params.id;
      const voteType = req.body.voteType;

      if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ error: "Invalid vote type" });
      }

      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Check if user already voted the same way
      const existingVote = await storage.getUserVote(postId, userId);
      if (existingVote?.voteType === voteType) {
        // Remove vote if clicking the same button
        await storage.deleteVote(postId, userId);
      } else {
        // Create or update vote
        await storage.createVote({ postId, userId, voteType });
      }

      // Get updated post with fresh vote counts
      const updatedPost = await storage.getPost(postId);
      const userVote = await storage.getUserVote(postId, userId);
      
      // Update post author's total votes received across ALL their posts
      const postAuthor = await storage.getUser(post.userId);
      if (postAuthor) {
        // Get all posts by this author with fresh data
        const userPosts = await storage.getPosts({ userId: post.userId, limit: 1000 });
        
        // Sum up all votes (upvotes + downvotes) from all their posts
        const totalVotes = userPosts.reduce((sum, p) => {
          console.log(`  Post ${p.id.substring(0, 8)}: ${p.upvotes} upvotes + ${p.downvotes} downvotes`);
          return sum + (p.upvotes || 0) + (p.downvotes || 0);
        }, 0);
        
        console.log(`[Vote] User ${postAuthor.username} total votes: ${totalVotes}`);
        
        await storage.updateUserStats(post.userId, {
          totalVotesReceived: totalVotes,
        });
      }
      
      res.cookie('anonymousId', userId, { 
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true 
      });
      
      res.json({
        ...updatedPost,
        userVote: userVote?.voteType || null,
      });
    } catch (error) {
      console.error("Error voting on post:", error);
      res.status(500).json({ error: "Failed to vote on post" });
    }
  });

  // Report a post
  app.post("/api/posts/:id/report", async (req, res) => {
    try {
      const loggedInUserId = req.cookies?.userId;
      const userId = loggedInUserId || getAnonymousUserId(req);
      const postId = req.params.id;

      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const existingReport = await storage.getUserReport(postId, userId);
      if (existingReport) {
        return res.json({ success: true, alreadyReported: true });
      }

      const payload = insertReportSchema.parse({
        postId,
        userId,
        reason: typeof req.body?.reason === "string" ? req.body.reason : undefined,
      });

      await storage.createReport(payload);

      res.cookie('anonymousId', userId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true
      });

      res.json({ success: true, alreadyReported: false });
    } catch (error) {
      console.error("Error reporting post:", error);
      res.status(500).json({ error: "Failed to report post" });
    }
  });

  // Favorite/unfavorite a post
  app.post("/api/posts/:id/favorite", async (req, res) => {
    try {
      const loggedInUserId = req.cookies?.userId;
      const userId = loggedInUserId || getAnonymousUserId(req);
      const postId = req.params.id;

      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const existingFavorite = await storage.getUserFavorite(postId, userId);
      if (existingFavorite) {
        await storage.deleteFavorite(postId, userId);
        res.cookie('anonymousId', userId, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
        return res.json({ success: true, favorited: false });
      }

      const payload = insertFavoriteSchema.parse({
        postId,
        userId,
      });

      await storage.createFavorite(payload);

      res.cookie('anonymousId', userId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.json({ success: true, favorited: true });
    } catch (error) {
      console.error("Error favoriting post:", error);
      res.status(500).json({ error: "Failed to favorite post" });
    }
  });

  // Get user's posts
  app.get("/api/users/:userId/posts", async (req, res) => {
    try {
      const { userId } = req.params;
      const posts = await storage.getPosts({ userId });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ error: "Failed to fetch user posts" });
    }
  });

  // Get user's favorited posts
  app.get("/api/users/:userId/favorites", async (req, res) => {
    try {
      const viewerId = req.cookies?.userId || getAnonymousUserId(req);
      const { userId } = req.params;

      const posts = await storage.getUserFavorites(userId);
      const postsWithMeta = await Promise.all(
        posts.map(async (post) => {
          const userVote = await storage.getUserVote(post.id, viewerId);
          const userFavorite = await storage.getUserFavorite(post.id, viewerId);
          return {
            ...post,
            metadata: post.metadata,
            userVote: userVote?.voteType || null,
            isFavorited: !!userFavorite,
          };
        })
      );

      res.cookie('anonymousId', viewerId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.json(postsWithMeta);
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Create a comment on a post
  app.post("/api/posts/:id/comments", async (req, res) => {
    try {
      const loggedInUserId = req.cookies?.userId;
      let userId: string | undefined;
      let anonymousId: string | undefined;
      let username: string;

      if (loggedInUserId) {
        userId = loggedInUserId;
        const user = await storage.getUser(loggedInUserId);
        username = user?.username || "Unknown";
      } else {
        anonymousId = getAnonymousUserId(req);
        username = "Anonymous";
      }

      const postId = req.params.id;
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const payload = insertCommentSchema.parse({
        postId,
        userId,
        anonymousId,
        username,
        text: req.body.text,
      });

      const comment = await storage.createComment(payload);

      if (anonymousId) {
        res.cookie('anonymousId', anonymousId, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ error: "Failed to create comment" });
    }
  });

  // Get all comments for a post
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const loggedInUserId = req.cookies?.userId;
      const anonymousId = getAnonymousUserId(req);
      const userId = loggedInUserId || anonymousId;

      const comments = await storage.getCommentsWithVotes(postId, userId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Delete a comment (only by creator)
  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const loggedInUserId = req.cookies?.userId;
      const anonymousId = getAnonymousUserId(req);
      const commentId = req.params.id;

      // Get the comment to check ownership
      const comment = await storage.getComment(commentId);

      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      console.log("[Delete Comment] Check ownership:", {
        loggedInUserId,
        anonymousId,
        commentUserId: comment.userId,
        commentAnonymousId: comment.anonymousId,
      });

      // Check if user is the creator
      // Match if: logged in and userId matches, OR anonymous and anonymousId matches
      const isOwner = (loggedInUserId && comment.userId && comment.userId === loggedInUserId) ||
                      (anonymousId && comment.anonymousId && comment.anonymousId === anonymousId);

      if (!isOwner) {
        console.log("[Delete Comment] Not authorized - ownership check failed");
        return res.status(403).json({ error: "Not authorized to delete this comment" });
      }

      await storage.deleteComment(commentId);

      res.cookie('anonymousId', anonymousId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Vote on a comment
  app.post("/api/comments/:id/vote", async (req, res) => {
    try {
      const loggedInUserId = req.cookies?.userId;
      const anonymousId = getAnonymousUserId(req);
      const userId = loggedInUserId || anonymousId;
      const commentId = req.params.id;

      // Verify comment exists
      const comment = await storage.getComment(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const { voteType } = req.body;
      if (!voteType || !['up', 'down'].includes(voteType)) {
        return res.status(400).json({ error: "Invalid vote type" });
      }

      // Check if user already voted on this comment
      const existingVote = await storage.getUserCommentVote(commentId, userId);

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Unvote (remove the vote)
          await storage.deleteCommentVote(commentId, userId);
        } else {
          // Change vote
          await storage.createCommentVote({ commentId, userId, voteType });
        }
      } else {
        // New vote
        await storage.createCommentVote({ commentId, userId, voteType });
      }

      // Set anonymous cookie if needed
      if (!loggedInUserId) {
        res.cookie('anonymousId', anonymousId, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }

      // Get updated comment
      const updatedComment = await storage.getComment(commentId);
      res.json(updatedComment);
    } catch (error) {
      console.error("Error voting on comment:", error);
      res.status(500).json({ error: "Failed to vote on comment" });
    }
  });

  // Report a comment
  app.post("/api/comments/:id/report", async (req, res) => {
    try {
      const loggedInUserId = req.cookies?.userId;
      const anonymousId = getAnonymousUserId(req);
      const userId = loggedInUserId || anonymousId;
      const commentId = req.params.id;

      // Verify comment exists
      const comment = await storage.getComment(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Check if user already reported this comment
      const existingReport = await storage.getUserCommentReport(commentId, userId);
      if (existingReport) {
        return res.json({ success: true, message: "Already reported" });
      }

      const payload = insertCommentReportSchema.parse({
        commentId,
        userId,
        reason: req.body.reason || null,
      });

      await storage.createCommentReport(payload);

      // Set anonymous cookie if needed
      if (!loggedInUserId) {
        res.cookie('anonymousId', anonymousId, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error reporting comment:", error);
      res.status(500).json({ error: "Failed to report comment" });
    }
  });

  // Get aggregated reports for mods
  app.get("/api/mod/reports", async (req, res) => {
    try {
      const loggedInUserId = req.cookies?.userId;

      if (!(await isAllowedModUser(loggedInUserId))) {
        return res.status(403).json({ error: "Mod account required" });
      }

      if (!hasModAccess(req)) {
        return res.status(403).json({ error: "Mod access required" });
      }

      touchModSession(req.cookies?.userId);

      const [postReports, commentReports] = await Promise.all([
        storage.getReportedPostsSummary(),
        storage.getReportedCommentsSummary(),
      ]);

      res.json({
        posts: postReports,
        messages: commentReports,
      });
    } catch (error) {
      console.error("Error fetching mod reports:", error);
      res.status(500).json({ error: "Failed to fetch mod reports" });
    }
  });

  app.get("/api/mod/status", async (req, res) => {
    const loggedInUserId = req.cookies?.userId;
    const activeModUserId = getActiveModUserId();
    const isAllowedMod = await isAllowedModUser(loggedInUserId);
    const unlocked = isAllowedMod && hasModAccess(req);
    const lockedByOther = isAllowedMod && !!activeModUserId && !!loggedInUserId && activeModUserId !== loggedInUserId;

    res.json({
      unlocked,
      lockedByOther,
      needsLogin: !loggedInUserId,
      notMod: !!loggedInUserId && !isAllowedMod,
    });
  });

  app.post("/api/mod/unlock", async (req, res) => {
    const loggedInUserId = req.cookies?.userId;
    const password = req.body?.password;
    const activeModUserId = getActiveModUserId();

    if (!loggedInUserId) {
      return res.status(401).json({ error: "Please sign in first" });
    }

    if (!(await isAllowedModUser(loggedInUserId))) {
      return res.status(403).json({ error: "This account is not a mod" });
    }

    if (activeModUserId && activeModUserId !== loggedInUserId) {
      return res.status(423).json({ error: "Another mod account is currently active" });
    }

    if (password !== MOD_PASSWORD) {
      return res.status(401).json({ error: "Wrong password" });
    }

    activeModSession = {
      userId: loggedInUserId,
      lastSeenAt: Date.now(),
    };

    return res.json({ success: true });
  });

  app.post("/api/mod/heartbeat", (req, res) => {
    const loggedInUserId = req.cookies?.userId;

    if (!loggedInUserId || !hasModAccess(req)) {
      return res.status(403).json({ error: "Mod access required" });
    }

    touchModSession(loggedInUserId);
    return res.json({ success: true });
  });

  app.post("/api/mod/lock", (req, res) => {
    const loggedInUserId = req.cookies?.userId;
    const activeModUserId = getActiveModUserId();

    if (loggedInUserId && activeModUserId === loggedInUserId) {
      activeModSession = null;
    }

    res.clearCookie("modAccess");

    return res.json({ success: true });
  });

  app.get("/api/mod/list", async (req, res) => {
    const loggedInUserId = req.cookies?.userId;

    if (!loggedInUserId || !(await isAllowedModUser(loggedInUserId))) {
      return res.status(403).json({ error: "Mod access required" });
    }

    const modUsernames = await storage.getModUsernames();
    return res.json({ mods: modUsernames });
  });

  app.post("/api/mod/add", async (req, res) => {
    const loggedInUserId = req.cookies?.userId;
    const { username } = req.body || {};

    if (!loggedInUserId || !(await isAllowedModUser(loggedInUserId))) {
      return res.status(403).json({ error: "Mod access required" });
    }

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ error: "Username required" });
    }

    const userToAdd = await storage.getUserByUsername(username);
    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    await storage.addModUsername(username);
    const modUsernames = await storage.getModUsernames();
    return res.json({ success: true, mods: modUsernames });
  });

  app.delete("/api/mod/remove", async (req, res) => {
    const loggedInUserId = req.cookies?.userId;
    const { username } = req.body || {};

    if (!loggedInUserId || !(await isAllowedModUser(loggedInUserId))) {
      return res.status(403).json({ error: "Mod access required" });
    }

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ error: "Username required" });
    }

    // Prevent removing yourself
    const currentUser = await storage.getUser(loggedInUserId);
    if (currentUser?.username.toLowerCase() === username.toLowerCase()) {
      return res.status(400).json({ error: "Cannot remove yourself as a mod" });
    }

    // Prevent removing the last mod
    const modUsernames = await storage.getModUsernames();
    if (modUsernames.length === 1 && modUsernames[0].toLowerCase() === username.toLowerCase()) {
      return res.status(400).json({ error: "Cannot remove the last mod" });
    }

    await storage.removeModUsername(username);
    const updatedMods = await storage.getModUsernames();
    return res.json({ success: true, mods: updatedMods });
  });

  return httpServer;
}
