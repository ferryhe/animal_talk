import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPostSchema, insertVoteSchema } from "@shared/schema";

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

  // Create a new post
  app.post("/api/posts", async (req, res) => {
    try {
      const userId = getAnonymousUserId(req);
      const data = insertPostSchema.parse({
        ...req.body,
        userId,
        username: req.body.username || "Anonymous",
      });
      
      const post = await storage.createPost(data);
      
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
      const userId = getAnonymousUserId(req);
      const post = await storage.getPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      if (post.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this post" });
      }

      await storage.deletePost(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Vote on a post
  app.post("/api/posts/:id/vote", async (req, res) => {
    try {
      const userId = getAnonymousUserId(req);
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

      // Get updated post
      const updatedPost = await storage.getPost(postId);
      const userVote = await storage.getUserVote(postId, userId);
      
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

  return httpServer;
}
