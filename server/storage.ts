import { type User, type InsertUser, type Post, type InsertPost, type Vote, type InsertVote, type PostWithVote, type PostMetadata } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStats(userId: string, updates: { totalPosts?: number; totalVotesReceived?: number }): Promise<User | undefined>;
  
  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPosts(filters?: { animal?: string; userId?: string; limit?: number; offset?: number }): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  
  // Vote methods
  createVote(vote: InsertVote): Promise<Vote>;
  deleteVote(postId: string, userId: string): Promise<boolean>;
  getUserVote(postId: string, userId: string): Promise<Vote | undefined>;
  updatePostVoteCount(postId: string): Promise<void>;
  
  // Combined methods
  getPostsWithVotes(userId: string, filters?: { animal?: string; limit?: number; offset?: number }): Promise<PostWithVote[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post>;
  private votes: Map<string, Vote>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.votes = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      bio: insertUser.bio || null,
      avatar: insertUser.avatar || "🐹",
      totalPosts: 0,
      totalVotesReceived: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStats(userId: string, updates: { totalPosts?: number; totalVotesReceived?: number }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    if (updates.totalPosts !== undefined) {
      user.totalPosts = updates.totalPosts;
    }
    if (updates.totalVotesReceived !== undefined) {
      user.totalVotesReceived = updates.totalVotesReceived;
    }

    this.users.set(userId, user);
    return user;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      audioData: insertPost.audioData ?? null,
      duration: insertPost.duration ?? null,
      confidence: insertPost.confidence ?? null,
      metadata: insertPost.metadata ?? null,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getPosts(filters?: { animal?: string; userId?: string; limit?: number; offset?: number }): Promise<Post[]> {
    let posts = Array.from(this.posts.values());
    
    if (filters?.animal) {
      posts = posts.filter(p => p.animal === filters.animal);
    }
    if (filters?.userId) {
      posts = posts.filter(p => p.userId === filters.userId);
    }
    
    // Sort by creation date, newest first
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    return posts.slice(offset, offset + limit);
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = randomUUID();
    const vote: Vote = {
      ...insertVote,
      id,
      createdAt: new Date(),
    };
    
    // Delete any existing vote by this user on this post
    await this.deleteVote(insertVote.postId, insertVote.userId);
    
    this.votes.set(id, vote);
    await this.updatePostVoteCount(insertVote.postId);
    return vote;
  }

  async deleteVote(postId: string, userId: string): Promise<boolean> {
    const existingVote = Array.from(this.votes.entries()).find(
      ([_, vote]) => vote.postId === postId && vote.userId === userId
    );
    
    if (existingVote) {
      this.votes.delete(existingVote[0]);
      await this.updatePostVoteCount(postId);
      return true;
    }
    return false;
  }

  async getUserVote(postId: string, userId: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      (vote) => vote.postId === postId && vote.userId === userId
    );
  }

  async updatePostVoteCount(postId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) return;

    const postVotes = Array.from(this.votes.values()).filter(v => v.postId === postId);
    const upvotes = postVotes.filter(v => v.voteType === 'up').length;
    const downvotes = postVotes.filter(v => v.voteType === 'down').length;

    post.upvotes = upvotes;
    post.downvotes = downvotes;
    this.posts.set(postId, post);
  }

  async getPostsWithVotes(userId: string, filters?: { animal?: string; limit?: number; offset?: number }): Promise<PostWithVote[]> {
    const posts = await this.getPosts(filters);
    
    return Promise.all(posts.map(async (post) => {
      const userVote = await this.getUserVote(post.id, userId);
      return {
        ...post,
        metadata: post.metadata as PostMetadata | undefined,
        userVote: userVote?.voteType as 'up' | 'down' | undefined || null,
      };
    }));
  }
}

export const storage = new MemStorage();
