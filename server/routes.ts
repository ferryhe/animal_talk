import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPostSchema, insertVoteSchema, insertUserSchema, insertReportSchema, insertFavoriteSchema, insertCommentSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
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
    res.clearCookie('userId');
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

      const comments = await storage.getCommentsByPostId(postId);
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

      // Check if user is the creator
      const isOwner = (loggedInUserId && comment.userId === loggedInUserId) ||
                      (!loggedInUserId && comment.anonymousId === anonymousId);

      if (!isOwner) {
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

  return httpServer;
}
